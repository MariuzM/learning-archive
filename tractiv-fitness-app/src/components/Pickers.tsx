import type BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { API_Durations } from '../apis/main.api';
import { useStoreUserActivities } from '../states/stateUserActivity.state';
import { Color, cssGlobal, Style } from '../styles/global.style';
import type { UserActivity } from '../types/activity.type';
import { TIME_SLOT_DURATION } from '../utils/dateTime.util';

export const TimePicker = ({
  bottomSheetRef,
  setFormValues,
}: {
  bottomSheetRef: React.RefObject<BottomSheet>;
  setFormValues: React.Dispatch<React.SetStateAction<UserActivity>>;
}) => {
  const [value, onChange] = useState(TIME_SLOT_DURATION);

  function handleConfirm() {
    if (value) {
      setFormValues((state) => ({
        ...state,
        duration: value || Object.keys(API_Durations).map(Number)[0],
      }));
      bottomSheetRef.current?.close();
    }
  }

  return (
    <View style={css.container}>
      <View style={css.actionContainer}>
        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.close()}
          style={[css.confirmBtn, { backgroundColor: Color.Slate }]}
        >
          <Text style={[cssGlobal.text_p_16, { color: Color.Snow }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleConfirm} style={css.confirmBtn}>
          <Text style={[cssGlobal.text_p_16, { color: Color.Snow }]}>Confirm</Text>
        </TouchableOpacity>
      </View>

      <Picker
        mode="dialog"
        selectedValue={value}
        onValueChange={(itemValue) => onChange(itemValue)}
      >
        {Object.entries(API_Durations).map(([k, v], i) => {
          return <Picker.Item key={i} label={v} value={Number(k)} color={Color.Snow} />;
        })}
      </Picker>
    </View>
  );
};

export const DateTimePicker = ({
  bottomSheetRef,
  setFormValues,
}: {
  bottomSheetRef: React.RefObject<BottomSheet>;
  setFormValues: React.Dispatch<React.SetStateAction<UserActivity>>;
}) => {
  const [value, onChange] = useState();
  const timeSlots = useStoreUserActivities((state) => state.timeSlots);

  function handleConfirm() {
    setFormValues((state) => ({ ...state, date: value || Object.keys(timeSlots)[0] }));
    bottomSheetRef.current?.close();
    onChange(undefined);
  }

  return (
    <View style={css.container}>
      <View style={css.actionContainer}>
        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.close()}
          style={[css.confirmBtn, { backgroundColor: Color.Slate }]}
        >
          <Text style={[cssGlobal.text_p_16, { color: Color.Snow }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleConfirm} style={css.confirmBtn}>
          <Text style={[cssGlobal.text_p_16, { color: Color.Snow }]}>Confirm</Text>
        </TouchableOpacity>
      </View>

      <Picker
        mode="dialog"
        selectedValue={value}
        onValueChange={(itemValue) => onChange(itemValue)}
      >
        {Object.entries(timeSlots).map(([k, v], i) => {
          return <Picker.Item key={i} label={v} value={k} color={Color.Snow} />;
        })}
      </Picker>
    </View>
  );
};

const css = StyleSheet.create({
  container: {
    borderRadius: Style.Radius,
    overflow: 'hidden',
    // backgroundColor: Color.Slate,
  },
  actionContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    height: 70,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  confirmBtn: {
    alignItems: 'center',
    backgroundColor: Color.Rust,
    borderRadius: Style.RadiusLg,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
