import GBottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { API_Activities, API_Durations } from '../apis/main.api';
import { useStoreUserActivities } from '../states/stateUserActivity.state';
import { Color, cssGlobal } from '../styles/global.style';
import type { UserActivity } from '../types/activity.type';

import { ButtonV2 } from './Buttons';
import { CloseIcon, DropDownIcon, SearchIcon } from './Icons';
import { InputSelect } from './InputSelect';
import { DateTimePicker, TimePicker } from './Pickers';
import { RoundedIcon } from './RoundedIcon';

type PickerTypes = 'none' | 'duration' | 'date';

export const BottomSheet = ({
  bottomSheetRef,
}: {
  bottomSheetRef: React.RefObject<GBottomSheet>;
}) => {
  const bottomSheetPickerRef = useRef<GBottomSheet>(null);
  const [pickerType, setPickerType] = useState<PickerTypes>('none');
  const [formValues, setFormValues] = useState<UserActivity>({
    activity: '',
    duration: 0,
    date: '',
  });
  const timeSlots = useStoreUserActivities((state) => state.timeSlots);

  // print pretty json
  // console.log(JSON.stringify(timeSlots, null, 2));

  function handleSubmit() {
    useStoreUserActivities.getState().addActivity(formValues);
    useStoreUserActivities.getState().initTimeSlots();
    setFormValues({ activity: '', duration: 0, date: '' });
  }

  return (
    <GBottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['100%']}
      backgroundStyle={{ backgroundColor: '#344856' }}
      handleComponent={null}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} onPress={() => bottomSheetRef.current?.close()} />
      )}
    >
      <SafeAreaView style={css.container}>
        <CloseIcon bottomSheetRef={bottomSheetRef} />

        <Text style={[cssGlobal.text_h1, css.title]}>Schedule your activity</Text>

        <IconContainer setFormValues={setFormValues} value={formValues.activity} />

        <View>
          <Text style={[cssGlobal.text_p, css.inputTitle]}>
            How long do you want to do this activity?
          </Text>
          <InputSelect
            onPress={() => bottomSheetPickerRef.current?.expand()}
            placeholder="Select activity duration"
            rightIcon={<DropDownIcon />}
            setPickerType={() => setPickerType('duration')}
            value={API_Durations[formValues.duration]}
          />
        </View>

        <View>
          <Text style={[cssGlobal.text_p, css.inputTitle]}>
            When do you want to do this activity?
          </Text>
          <InputSelect
            onPress={() => bottomSheetPickerRef.current?.expand()}
            placeholder="Pick a date & time or find a free slot"
            rightIcon={<SearchIcon />}
            setPickerType={() => setPickerType('date')}
            value={timeSlots[formValues.date]}
          />
        </View>

        <ButtonV2
          bottomSheetRef={bottomSheetRef}
          isDisabled={!(formValues.activity && formValues.duration && formValues.date)}
          handleSubmit={handleSubmit}
        />
      </SafeAreaView>

      <BottomSheetPicker
        bottomSheetRef={bottomSheetPickerRef}
        pickerType={pickerType}
        setFormValues={setFormValues}
      />
    </GBottomSheet>
  );
};

const IconContainer = ({
  setFormValues,
  value,
}: {
  setFormValues: React.Dispatch<React.SetStateAction<UserActivity>>;
  value: string;
}) => {
  const [selectedIcon, setSelectedIcon] = useState<number | null>(null);

  useEffect(() => {
    if (value === '') setSelectedIcon(null);
  }, [value]);

  return (
    <View style={css.iconsContainer}>
      {API_Activities.map((item) => (
        <RoundedIcon
          key={item.id}
          icon={item.icon}
          name={item.name}
          isSelected={selectedIcon === item.id}
          onPress={() => [
            setSelectedIcon(item.id),
            setFormValues((state) => ({ ...state, activity: item.name })),
          ]}
        />
      ))}
    </View>
  );
};

const css = StyleSheet.create({
  container: {
    gap: 40,
    height: '100%',
    margin: 20,
  },
  title: {
    alignSelf: 'center',
    color: Color.Snow,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  inputTitle: {
    ...cssGlobal.text_p,
    color: Color.Snow,
    marginBottom: 8,
  },
});

// ==================================================================

export const BottomSheetPicker = ({
  bottomSheetRef,
  pickerType,
  setFormValues,
}: {
  bottomSheetRef: React.RefObject<GBottomSheet>;
  pickerType: PickerTypes;
  setFormValues: React.Dispatch<React.SetStateAction<UserActivity>>;
}) => {
  return (
    <GBottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={[1, 350]}
      backgroundStyle={{
        backgroundColor: Color.Slate,
        shadowColor: Color.SlateDark,
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
      }}
      handleComponent={null}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} onPress={() => bottomSheetRef.current?.close()} />
      )}
    >
      {pickerType === 'duration' && (
        <TimePicker bottomSheetRef={bottomSheetRef} setFormValues={setFormValues} />
      )}
      {pickerType === 'date' && (
        <DateTimePicker bottomSheetRef={bottomSheetRef} setFormValues={setFormValues} />
      )}
    </GBottomSheet>
  );
};
