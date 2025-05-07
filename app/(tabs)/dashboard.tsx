import React, { useState, useEffect, useMemo } from "react";
import {
  Platform,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Text as NativeText,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FloatingAction } from "react-native-floating-action";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, Button, Icon } from "react-native-elements";
const { width } = Dimensions.get("window");
const cellSize = width / 7 - 8;

interface Event {
  hour: number;
  title: string;
  description: string;
  category: string;
}

interface EventToEdit {
  day: number;
  hour: number;
  eventIndex: number;
}

interface IEventGroup {
  day: number;
  events: Event[];
}

const actions = [
  {
    text: "Add event",
    icon: require("../../assets/images/icon.png"),
    name: "bt_accessibility",
    position: 1,
  },
];
const STORAGE_KEY = "@events";

const DashboardScreen: React.FC = () => {
  const [events, setEvents] = useState<IEventGroup[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dates, setDates] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredEvents, setFilteredEvents] = useState<IEventGroup[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [newEvents, setNewEvents] = useState<IEventGroup[]>([]); // Changed type here

  const [newEventDate, setNewEventDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const searchInputRef = React.useRef<TextInput | null>(null);
  const [isAddEventModalVisible, setIsAddEventModalVisible] = useState(false);
  const [newEventCategory, setNewEventCategory] = useState<string>("Personal");
  const [error, setError] = useState("");
  const [ampm, setAMPM] = useState("AM");

  const toggleAMPM = (value: any) => {
    setAMPM(value);
  };

  const getMonthName = (date: Date) =>
    date.toLocaleString("default", { month: "long" });

  dates.toLocaleString("default", { month: "long" });
  const getYear = (date: Date) => date.getFullYear();

  const updateDates = (date: Date) => {
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    const datesArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    setDates(datesArray);
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Permission Error",
          "Notifications permission is required to use reminders."
        );
        return false;
      }
    }
    return true;
  };

  const scheduleNotification = async (
    event: Event,
    day: number,
    month: number,
    year: number
  ) => {
    try {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        return;
      }

      const trigger = new Date(year, month, day, event.hour, 0, 0);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: event.title,
          body: event.description,
        },
        trigger: trigger.getTime() - Date.now() > 0 ? { date: trigger } : null,
      } as any);
      console.log(
        `Notification scheduled for event: ${event.title} with id: ${notificationId}`
      );
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  const loadEvents = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setEvents(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Failed to load events from storage", e);
    }
  };

  const saveEvents = async (value: IEventGroup[]) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error("Failed to save events to storage", e);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    updateDates(currentDate);
  }, [currentDate]);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getEventsForDate = (day: number): Event[] => {
    if (day === null) return [];
    return events.find((group) => group.day === day)?.events || [];
  };

  const [eventToEdit, setEventToEdit] = useState<EventToEdit | null>(null);

  const handleDatePress = (day: number) => {
    setSelectedDate(day);
  };

  const onTimeChange = (_event: any, selectedTime: Date | undefined) => {
    if (_event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }

    if (selectedTime) {
      const updated = new Date(newEventDate);
      let hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();

      // Adjust hours based on AM/PM toggle
      if (ampm === "PM" && hours < 12) {
        hours += 12;
      } else if (ampm === "AM" && hours === 12) {
        hours = 0;
      }

      updated.setHours(hours);
      updated.setMinutes(minutes);
      setNewEventDate(updated);
    }

    setShowTimePicker(false);
  };
  const renderItem = ({ item }: { item: number }) => (
    <TouchableOpacity onPress={() => handleDatePress(item)}>
      <View style={styles.card}>
        <NativeText style={styles.dateText}>{item}</NativeText>
      </View>
    </TouchableOpacity>
  );

  const handleHourPress = (hour: number, day: number, index: number) => {
    setSelectedHour(hour);
    setEventToEdit({ day, hour: hour, eventIndex: index });
    setIsModalVisible(true);
  };
  const [newEventTitle, setNewEventTitle] = useState<string>("");

  const onDateChange = (_event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewEventDate((prev) => {
        const updated = new Date(prev);
        updated.setFullYear(selectedDate.getFullYear());
        updated.setMonth(selectedDate.getMonth());
        updated.setDate(selectedDate.getDate());
        return updated;
      });
    }
  };
  const handleOpenAddModal = () => {
    setIsAddEventModalVisible(true);
  };
  const [newEventDescription, setNewEventDescription] = useState<string>("");

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setSelectedHour(null);
  };

  const handleAddEvent = () => {
    if (
      !newEventTitle.trim() ||
      !newEventDescription.trim() ||
      !newEventCategory.trim()
    ) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const selectedDay = new Date(newEventDate).getDate();
    const selectedHour = new Date(newEventDate).getHours();

    if (selectedDay !== null && selectedHour !== null) {
      const newEvent = {
        hour: selectedHour,
        title: newEventTitle,
        description: newEventDescription,
        category: newEventCategory,
      };

      setEvents((prevEvents: any) => {
        const eventGroupIndex = prevEvents.findIndex(
          (group: any) => group.day === selectedDay
        );

        if (eventGroupIndex !== -1) {
          const updatedEvents = [...prevEvents];
          updatedEvents[eventGroupIndex].events.push(newEvent);
          return updatedEvents;
        } else {
          return [...prevEvents, { day: selectedDay, events: [newEvent] }];
        }
      });

      setIsAddEventModalVisible(false);
      setIsModalVisible(false);

      setNewEventDate(new Date());
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventCategory("Personal");
      setSelectedDate(null);

      const month = new Date(newEventDate).getMonth();
      const year = new Date(newEventDate).getFullYear();
      if (selectedDate !== null) {
        scheduleNotification(newEvent, selectedDate, month, year);
      }
    }
  };

  const handleEditEvent = () => {
    if (eventToEdit && selectedHour !== null) {
      const { day, eventIndex, hour } = eventToEdit;
      setEvents((prevEvents) => {
        const eventGroupIndex = prevEvents.findIndex(
          (group) => group.day === day
        );
        if (eventGroupIndex !== -1) {
          const updatedEvents = [...prevEvents];
          const eventToUpdate =
            updatedEvents[eventGroupIndex].events[eventIndex];
          if (eventToUpdate) {
            eventToUpdate.title = newEventTitle;
            eventToUpdate.description = newEventDescription;
            eventToUpdate.hour = selectedHour;
            eventToUpdate.category = newEventCategory;
          }

          return updatedEvents;
        } else {
          return prevEvents;
        }
      });

      setIsModalVisible(false);
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventCategory("Personal");
    }
  };

  const handleDeleteEvent = () => {
    if (eventToEdit) {
      Alert.alert(
        "Delete Event",
        "Are you sure you want to delete this event?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setEvents((prevEvents) => {
                if (eventToEdit) {
                  const { day, eventIndex } = eventToEdit;
                  const updatedEvents = [...prevEvents];
                  const eventGroupIndex = updatedEvents.findIndex(
                    (group) => group.day === day
                  );
                  if (eventGroupIndex !== -1 && eventIndex > -1) {
                    updatedEvents[eventGroupIndex].events.splice(eventIndex, 1);
                    if (updatedEvents[eventGroupIndex].events.length === 0) {
                      updatedEvents.splice(eventGroupIndex, 1);
                    }
                    return updatedEvents;
                  }
                }
                return prevEvents;
              });
              setIsModalVisible(false);
              setEventToEdit(null);
            },
          },
        ]
      );
    }
  };

  useEffect(() => {
    if (selectedDate && selectedHour !== null && eventToEdit) {
      const { day, eventIndex } = eventToEdit;
      const events = getEventsForDate(day);
      if (events.length > 0 && eventIndex >= 0) {
        const event = events[eventIndex];
        setNewEventTitle(event.title || "");
        setNewEventCategory(event.category || "Personal");
        setNewEventDescription(event.description || "");
      }
    } else {
      setNewEventTitle("");
      setNewEventDescription("");
    }
  }, [selectedDate, selectedHour, eventToEdit, events]);

  const categoryColors: { [key: string]: string } = {
    Personal: "#lightblue",
    Work: "#90EE90",
    Social: "#FFB6C1",
    Study: "#FFFFE0",
  };

  const getEventColor = (category: string) =>
    categoryColors[category] || "lightgray";

  useEffect(() => {
    const filtered = events
      .map((group) => ({
        ...group,
        events: group.events.filter((event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((group) => group.events.length > 0);

    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const getEventsForDateFiltered = (day: number): Event[] => {
    if (!searchTerm) {
      return getEventsForDate(day); // Return all events if there's no search term
    }

    const eventGroup = filteredEvents.find((group) => group.day === day);

    if (eventGroup) {
      return eventGroup.events; // Return filtered events if they exist
    } else {
      return []; // No events match the filter
    }
  };
  const formatHour12 = (hour: number): string => {
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:00 ${period}`;
  };

  const renderHoursAndEvents = useMemo(() => {
    if (selectedDate === null) return null;
    if (selectedDate === null) return null;
    const events = getEventsForDate(selectedDate);

    return (
      <View
        style={{
          width: "100%",
          padding: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => setSelectedDate(null)}
          style={styles.crossButton}
        >
          <Text style={styles.crossButtonText}>✖️ Back</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scheduleScroll}>
          {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
            const eventsAtHour = events.filter((event) => event.hour === hour);
            const hasEvents = eventsAtHour.length > 0;

            return (
              <TouchableOpacity
                key={hour}
                onPress={() => {
                  const eventIndex = events.findIndex(
                    (event) => event.hour === hour
                  );
                  handleHourPress(hour, selectedDate, eventIndex);
                }}
                style={styles.hourBlockWrapper}
              >
                <View
                  style={[styles.hourRow, hasEvents && styles.hourRowActive]}
                >
                  <Text style={styles.hourLabel}>{formatHour12(hour)}</Text>

                  {/* <View style={styles.eventsContainer}>
                    {eventsAtHour.map((event, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.eventCard,
                          { backgroundColor: getEventColor(event.category) },
                        ]}
                      >
                        <Text style={styles.eventText}>
                          {event.title}: {event.description}
                        </Text>
                      </View>
                    ))}
                  </View> */}
                  <View style={styles.eventsContainer}>
                    {eventsAtHour.map((event, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.eventCard,
                          { backgroundColor: getEventColor(event.category) },
                        ]}
                      >
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventDescription}>
                          {event.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent
          onRequestClose={handleCancelModal}
        >
          <View style={styles.modalBackdrop}>
            <Animated.View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>🎯 Event Title</Text>
              <TextInput
                placeholder="Enter Event name"
                value={newEventTitle}
                onChangeText={setNewEventTitle}
                style={styles.input}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Text style={styles.modalTitle}>📝 Description</Text>
              <TextInput
                placeholder="Enter Event Description"
                value={newEventDescription}
                onChangeText={setNewEventDescription}
                style={styles.input}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                <Text style={styles.dateButtonText}>
                  📅 {newEventDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  testID="timePicker"
                  value={newEventDate}
                  mode="time"
                  is24Hour={false} // Force 12-hour format
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onTimeChange}
                />
              )}

              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={styles.dateButton}
              >
                <Text style={styles.dateButtonText}>
                  ⏰{" "}
                  {newEventDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <>
                  <DateTimePicker
                    testID="timePicker"
                    value={newEventDate}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onTimeChange}
                  />
                  <View style={styles.ampmToggle}>
                    <TouchableOpacity onPress={() => toggleAMPM("AM")}>
                      <Text
                        style={
                          ampm === "AM" ? styles.selected : styles.unselected
                        }
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleAMPM("PM")}>
                      <Text
                        style={
                          ampm === "PM" ? styles.selected : styles.unselected
                        }
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View style={styles.buttonRow}>
                {eventToEdit && eventToEdit.eventIndex !== -1 ? (
                  <TouchableOpacity
                    onPress={handleEditEvent}
                    style={styles.saveButton}
                  >
                    <Text style={styles.buttonText}>💾 Save</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleAddEvent}
                    style={styles.addButton}
                  >
                    <Text style={styles.buttonText}>➕ Add</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleDeleteEvent}
                  style={styles.deleteButton}
                >
                  <Text style={styles.buttonText}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleCancelModal}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>❌ Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </View>
    );
  }, [
    selectedDate,
    currentDate,
    events,
    newEventTitle,
    newEventDescription,
    selectedHour,
  ]);

  return (
    <View style={styles.container}>
      {/* <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={[styles.monthButton, { backgroundColor: "#0056b3" }]}
        >
          <Icon
            name="chevron-left"
            type="font-awesome"
            color="#FFF"
            size={20}
          />
        </TouchableOpacity>
        <Text h4 style={styles.monthTitle}>{`${getMonthName(
          currentDate
        )} ${getYear(currentDate)}`}</Text>

        <View style={styles.searchBarContainer}>
          <TouchableOpacity
            onPress={handleNextMonth}
            style={[styles.monthButton, { backgroundColor: "#0056b3" }]}
          >
            <Icon
              name="chevron-right"
              type="font-awesome"
              color="#FFF"
              size={20}
            />
          </TouchableOpacity>
          <Icon name="search" type="Feather" color="#FFF" size={20} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search Events"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />{error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View> */}
      <View style={[styles.calendarHeaderWrapper, { paddingTop: insets.top }]}>
        {/* Left Navigation */}
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={[styles.navButton, styles.navButtonLeft]}
        >
          <Icon
            name="chevron-left"
            type="font-awesome"
            color="#FFF"
            size={20}
          />
        </TouchableOpacity>

        {/* Current Month Display */}
        <Text h4 style={styles.currentMonthText}>
          {`${getMonthName(currentDate)} ${getYear(currentDate)}`}
        </Text>

        {/* Right Navigation + Search */}
        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            onPress={handleNextMonth}
            style={[styles.navButton, styles.navButtonRight]}
          >
            <Icon
              name="chevron-right"
              type="font-awesome"
              color="#FFF"
              size={20}
            />
          </TouchableOpacity>

          <View style={styles.searchWrapper}>
            <Icon name="search" type="feather" color="#666" size={18} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search Events"
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>

      <FlatList
        data={dates}
        renderItem={renderItem}
        keyExtractor={(item) => item.toString()}
        numColumns={7}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row} // evenly space columns
      />
      <Modal visible={isAddEventModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Event Title:</Text>
            <TextInput
              placeholder="Enter Event name"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              style={styles.input}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.modalTitle}>Event Description:</Text>
            <TextInput
              placeholder="Enter Event Description"
              value={newEventDescription}
              onChangeText={setNewEventDescription}
              style={styles.input}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>
                📅 Date: {newEventDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(newEventDate)}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
              />
            )}

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>
                ⏰ Time:{" "}
                {newEventDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <>
                <DateTimePicker
                  testID="timePicker"
                  value={newEventDate}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onTimeChange}
                />
                <View style={styles.ampmToggle}>
                  <TouchableOpacity onPress={() => toggleAMPM("AM")}>
                    <Text
                      style={
                        ampm === "AM" ? styles.selected : styles.unselected
                      }
                    >
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleAMPM("PM")}>
                    <Text
                      style={
                        ampm === "PM" ? styles.selected : styles.unselected
                      }
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
              <Text style={styles.addButtonText}>➕ Add Event</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsAddEventModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingAction
        actions={actions}
        onPressItem={(name) => {
          if (name === "bt_accessibility") {
            handleOpenAddModal();
            setSelectedDate(null);
          }
        }}
      />
      {renderHoursAndEvents}
    </View>
  );
};
export default DashboardScreen;

const cardDimension = (width - 20) / 7;
const hourContainerHeight = 25;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#007BFF",
  },
  monthTitle: {
    fontWeight: "bold",
  },
  card: {
    width: cardDimension,
    height: cardDimension,
    alignItems: "center",
    justifyContent: "center",
    margin: 1,
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
  },
  dateText: {
    fontSize: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 300,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  hourContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: hourContainerHeight,
    paddingHorizontal: 10,
  },
  hourText: {
    marginRight: 20,
    fontWeight: "bold",
  },
  monthButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  inputError: {
    borderColor: "red",
  },
  calendarHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  navButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#0056b3",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonLeft: {
    marginRight: 8,
  },
  navButtonRight: {
    marginLeft: 8,
  },
  currentMonthText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchInput: {
    marginLeft: 6,
    padding: 0,
    height: 20,
    fontSize: 14,
    color: "#333",
    minWidth: 100,
  },
  hourBlockWrapper: {
    width: "100%",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  hourRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 8,
    gap: 12,
    minHeight: 60, // 👈 fixed consistent height
  },
  hourRowActive: {
    backgroundColor: "#f1f9ff",
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
    borderRadius: 8,
  },
  hourLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    width: 60,
  },
  eventText: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  scheduleScroll: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  gridContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#fff",
  },
  row: {
    marginBottom: 8,
  },
  dayCell: {
    width: cellSize,
    height: cellSize,
    borderRadius: 12,
    backgroundColor: "#f5f8ff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedDay: {
    backgroundColor: "#007bff",
  },
  selectedDayText: {
    color: "#fff",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 13,
  },
  dateButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateButtonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  saveButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  cancelButton: {
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#555",
    fontWeight: "500",
  },
  ampmToggle: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 20,
  },
  selected: {
    color: "white",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    fontWeight: "bold",
  },
  unselected: {
    color: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  crossButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    zIndex: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  crossButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  eventsContainer: {
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
    width: "100%",
  },

  eventCard: {
    borderRadius: 12,
    padding: 12,
    shadowColor: "#343423",
    elevation: 0.5,
    shadowOffset: { width: 0, height: 1 },
    width: 220,
  },

  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#668878",
    marginBottom: 4,
    textTransform: "capitalize",
    padding: 2,
    borderRadius: 8,
  },

  eventDescription: {
    fontSize: 13,
    color: "#668878",
  },
});
