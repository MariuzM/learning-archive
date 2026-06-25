import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { activityIcons, API_Durations } from '../apis/main.api';
import { useStoreUserActivities } from '../states/stateUserActivity.state';
import { Color, cssGlobal, Shadows, Style } from '../styles/global.style';

export const ActivitySection = () => {
  const userActivities = useStoreUserActivities((state) => state.userActivityRecords);
  const slotsForEachDay = useStoreUserActivities((state) => state.slotsForEachDay);

  return (
    <View style={css.container}>
      {Object.keys(userActivities).length > 0 ? (
        <>
          <Text style={cssGlobal.text_h2}>Scheduled Activities</Text>

          {Object.entries(userActivities).map(([k, v], i) => {
            const dateObject = new Date(k);
            const monthName = new Intl.DateTimeFormat('en-US', {
              month: 'long',
              day: 'numeric',
            }).format(dateObject);
            const dayOfWeek = new Intl.DateTimeFormat('en-US', {
              weekday: 'long',
            }).format(dateObject);

            return (
              <View key={i} style={css.content}>
                <View>
                  <Text style={css.monthName}>{monthName}</Text>
                  <Text style={css.dayOfWeek}>{dayOfWeek}</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollToOverflowEnabled={false}
                  style={{
                    marginHorizontal: -20,
                  }}
                  contentContainerStyle={css.activitiesContainer}
                >
                  {v.map((item, i) => {
                    const formattedTime = new Date(item.date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    });
                    return (
                      <View key={i} style={css.activity}>
                        <View style={css.activityIcon}>{activityIcons[item.activity]}</View>
                        <Text style={cssGlobal.text_p}>{formattedTime}</Text>
                        <Text style={cssGlobal.text_p}>{API_Durations[item.duration]}</Text>
                      </View>
                    );
                  })}

                  {[...Array(slotsForEachDay[k] - v.length).keys()].map((i) => (
                    <View key={i} style={css.activityIconNone} />
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </>
      ) : (
        <>
          <Text style={cssGlobal.text_h2}>Track Your Activity</Text>
          <Text style={cssGlobal.text_p}>You don't have any activities scheduled yet.</Text>
        </>
      )}
    </View>
  );
};

const css = StyleSheet.create({
  container: {
    gap: 20,
  },
  content: {
    gap: 12,
  },
  activitiesContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
  },
  activity: {
    alignItems: 'center',
  },
  activityIcon: {
    alignItems: 'center',
    backgroundColor: Color.Snow,
    borderRadius: Style.RadiusRound,
    height: 60,
    justifyContent: 'center',
    marginBottom: 8,
    width: 60,
    ...Shadows.ShadowMd,
  },
  activityIconNone: {
    backgroundColor: Color.Ice,
    borderColor: Color.Steel,
    borderRadius: Style.RadiusRound,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 60,
    marginBottom: 8,
    opacity: 0.5,
    width: 60,
  },
  monthName: {
    color: Color.Slate,
    fontFamily: 'RiftSoft-Demi',
    fontSize: 14,
    letterSpacing: 2.1,
  },
  dayOfWeek: {
    ...cssGlobal.text_h2,
  },
});
