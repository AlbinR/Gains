// import React, {
//   useCallback, useEffect, useMemo, useRef, useContext, useState,
// } from 'react';
// import {
//   FlatList, Keyboard, KeyboardAvoidingView, Pressable, StyleSheet,
// } from 'react-native';
// import {
//   Button, Dialog, List, Portal, Searchbar, TextInput, useTheme,
// } from 'react-native-paper';
// import { BarCodeScannedCallback, BarCodeScanner, PermissionStatus } from 'expo-barcode-scanner';
// import { useShowSnackbar } from 'react-native-telegraph';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

// import { View } from '../components/Themed';
// import { RootTabScreenProps } from '../../types';
// import useBoolState from '../hooks/useBoolState';
// import { useAddExercise, useExercises } from '../contexts/WorkoutDataContext';
// import { AuthContext } from '../contexts/AuthContext';
// import { WorkoutExerciseType } from '../../clients/__generated__/schema';

// const QrScanner: React.FC<{ readonly isVisible: boolean, readonly onDismiss: () => void, readonly onScan: BarCodeScannedCallback }> = ({ isVisible, onDismiss, onScan }) => {
//   // const [hasPermission, setHasPermission] = useState<boolean | null>(null);
//   const showSnackbar = useShowSnackbar();

//   useEffect(() => {
//     if (isVisible) {
//       Keyboard.dismiss();
//       void (async () => {
//         const { status } = await BarCodeScanner.requestPermissionsAsync();
//         if (status === PermissionStatus.DENIED) {
//           showSnackbar('Please enable camera permissions in settings');
//           onDismiss();
//         }
//       })();
//     }
//   }, [isVisible, onDismiss, showSnackbar]);

//   return isVisible ? (
//     <Portal>
//       <View style={[StyleSheet.absoluteFillObject, { flex: 1 }]}>
//         <BarCodeScanner
//           onBarCodeScanned={onScan}
//           style={StyleSheet.absoluteFillObject}
//         />
//       </View>
//     </Portal>
//   ) : null;
// };

// const CreateWorkoutDialog: React.FC<{ readonly title?: string, readonly isVisible: boolean, readonly onDismiss: () => void, readonly onCreate: (name: string) => void }> = ({
//   isVisible, title, onDismiss, onCreate,
// }) => {
//   const workoutName = useRef('');

//   const onCreateInternal = useCallback(() => {
//     onCreate(workoutName.current);
//   }, [onCreate]);

//   useEffect(() => {
//     if (!isVisible) {
//       workoutName.current = '';
//     }
//   }, [isVisible]);

//   return (
//     <Portal>

//       <Dialog visible={isVisible} onDismiss={onDismiss}>
//         <KeyboardAvoidingView>
//           <Dialog.Title>{title || 'Create workout'}</Dialog.Title>
//           <Dialog.Content>
//             <TextInput
//               onSubmitEditing={onCreateInternal}
//               placeholder='Workout name'
//               autoFocus
//               onChangeText={(text) => { workoutName.current = text; }}
//             />
//           </Dialog.Content>
//           <Dialog.Actions>
//             <Button onPress={onDismiss}>Cancel</Button>
//             <Button onPress={onCreateInternal}>Create</Button>
//           </Dialog.Actions>
//         </KeyboardAvoidingView>
//       </Dialog>

//     </Portal>
//   );
// };

// export default function TabScreen({ navigation }: RootTabScreenProps<'WorkoutListTab'>) {
//   const workouts = useExercises();
//   const addWorkout = useAddExercise();
//   const { logout } = useContext(AuthContext);
//   const [searchQuery, setSearchQuery] = React.useState('');
//   const [isCreateWorkoutDialogVisible, showWorkoutDialog, hideWorkoutDialog] = useBoolState(false);
//   const [isQrScannerVisible, showQrScanner, hideQrScanner] = useBoolState(false);
//   const [lastScannedQRCode, setLastScannedQRCode] = useState<{readonly data: string, readonly type: string}>();
//   const showSnackbar = useShowSnackbar();
//   const theme = useTheme();

//   const workoutsToShow = useMemo(() => (searchQuery.length > 0
//     ? workouts.filter((w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
//     : workouts), [searchQuery, workouts]);

//   useEffect(() => {
//     navigation.setOptions({
//       headerLeft: (props) => (
//         <Pressable
//           onPress={showQrScanner}
//           style={({ pressed }) => ({
//             opacity: pressed ? 0.5 : 1,
//           })}
//         >
//           <MaterialCommunityIcons
//             name='qrcode-scan'
//             size={25}
//             color={theme.colors.text}
//             style={{ marginLeft: 15 }}
//           />
//         </Pressable>
//       ),
//       headerRight: (props) => (
//         <Pressable
//           onPress={showWorkoutDialog}
//           style={({ pressed }) => ({
//             opacity: pressed ? 0.5 : 1,
//           })}
//         >

//           <MaterialCommunityIcons
//             name='plus'
//             size={25}
//             color={theme.colors.text}
//             style={{ marginRight: 15 }}
//           />
//         </Pressable>
//       ),
//     });
//   }, [logout, navigation, showWorkoutDialog, theme.colors.text, showQrScanner]);

//   return (
//     <View style={styles.container}>
//       <QrScanner
//         isVisible={isQrScannerVisible}
//         onDismiss={hideQrScanner}
//         onScan={({ data, type }) => {
//           hideQrScanner();
//           const existingWorkout = workouts.find((w) => w.associatedCodes[type] === data);
//           if (existingWorkout) {
//             navigation.navigate('Modal', { exercise: existingWorkout });
//           } else {
//             showWorkoutDialog();
//             setLastScannedQRCode({ data, type });
//           }

//           // showSnackbar('QR code scanned, will be associated with workout');
//         }}
//       />
//       <CreateWorkoutDialog
//         isVisible={isCreateWorkoutDialogVisible}
//         onDismiss={hideWorkoutDialog}
//         title={lastScannedQRCode ? `Give it a name` : undefined}
//         onCreate={(name) => {
//           hideWorkoutDialog();
//           const associatedCodes = lastScannedQRCode ? { [lastScannedQRCode.type]: lastScannedQRCode.data } : {};
//           addWorkout({ name, associatedCodes, workoutExerciseType: WorkoutExerciseType.GOOD_MORNING });
//           setLastScannedQRCode(undefined);
//         }}
//       />

//       <Searchbar placeholder='Search tracked workouts..' value={searchQuery} onChangeText={setSearchQuery} autoFocus />
//       <FlatList
//         data={workoutsToShow}
//         style={{ width: '100%' }}
//         renderItem={({ item }) => (
//           <List.Item
//             onPress={() => {
//               navigation.navigate('Modal', { exercise: item });
//             }}
//             title={item.name}
//           />
//         )}
//       />
//     </View>
//   );
// }
// /*
// <Button icon={'qrcode-scan'} onPress={showQrScanner}>Scan any QR</Button>
// <Button icon={'plus'} onPress={showWorkoutDialog}>Create new workout</Button>
// */
// // https://lottiefiles.com/dinhdesigner
// // https://lottiefiles.com/18558-chinup-animation
// // https://lottiefiles.com/76478-seated-dumbbell-bicep-curl
// // https://lottiefiles.com/87454-cycling
// // https://lottiefiles.com/78268-workout
// // https://lottiefiles.com/61723-fitness
// // https://lottiefiles.com/leveragestudio
// // https://lottiefiles.com/29951-healthy-lifestyle-exercise
// // https://lottiefiles.com/saagarshrest
// // https://lottiefiles.com/74248-women-leg-press-workout-routine-at-home
// // https://lottiefiles.com/13594-protein-prinsen

// // arm-flex arm-flex-outline weight-lifter seat-legroom-extra dumbbell kettlebell heart-pulse human-handsup human-handsdown

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   separator: {
//     marginVertical: 30,
//     height: 1,
//     width: '80%',
//   },
// });
