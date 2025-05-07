 /* <Modal visible={isAddEventModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Event Title:</Text>
          <TextInput
            placeholder="Enter Event name"
            value={newEventTitle}
            onChangeText={setNewEventTitle}
            style={styles.input}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text>Event Description:</Text>
          <TextInput
            placeholder="Enter Event Description"
            value={newEventDescription}
            onChangeText={setNewEventDescription}
            style={styles.input}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button
            title={`Date: ${newEventDate.toLocaleDateString()}`}
            onPress={() => setShowDatePicker(true)}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={new Date(newEventDate)}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        )}

        <Button
          title={`Time: ${newEventDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`}
          onPress={() => setShowTimePicker(true)}
        />
        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={newEventDate}
            mode="time"
            is24Hour={true}
            onChange={onTimeChange}
          />
        )}
        <View>
          <Button title="Add Event" onPress={handleAddEvent} />
        </View>
        <Button
          title="Cancel"
          onPress={() => {
            setIsAddEventModalVisible(false);
          }}
        />
      </Modal> */






       /* <Modal visible={isModalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <Text>Event Title:</Text>
            <TextInput
              placeholder="Enter Event name"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              style={styles.input}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text>Event Description:</Text>
            <TextInput
              placeholder="Enter Event Description"
              value={newEventDescription}
              onChangeText={setNewEventDescription}
              style={styles.input}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button
              title={`Date: ${newEventDate.toLocaleDateString()}`}
              onPress={() => setShowDatePicker(true)}
            />

            {showDatePicker && (
              <DateTimePicker
                testID="datePicker"
                value={new Date(newEventDate)}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
              />
            )}

            <Button
              title={`Time: ${newEventDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`}
              onPress={() => setShowTimePicker(true)}
            />
            {showTimePicker && (
              <DateTimePicker
                testID="timePicker"
                value={newEventDate}
                mode="time"
                is24Hour={true}
                onChange={onTimeChange}
              />
            )}

            <View>
              {eventToEdit && eventToEdit.eventIndex !== -1 ? (
                <Button title="Save Changes" onPress={handleEditEvent} />
              ) : (
                <Button title="Add Event" onPress={handleAddEvent} />
              )}
              <Button title="Delete Event" onPress={handleDeleteEvent} />
            </View>

            <Button title="Cancel" onPress={handleCancelModal} />
          </View>
        </Modal> */


         /* {Array.from({ length: 24 }, (_, i) => i).map((hour, index) => (
          <TouchableOpacity
            key={hour}
            onPress={() => {
              const eventIndex = events.findIndex(
                (event) => event.hour === hour
              );
              handleHourPress(hour, selectedDate, eventIndex);
            }}
          >
            <View style={styles.hourContainer}>
              <Text style={styles.hourText}>{hour}:00</Text>
              <View>
                {events
                  .filter((event) => event.hour === hour)
                  .map((event, idx) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: getEventColor(event.category),
                        padding: 5,
                        height: 30,
                        borderRadius: 5,
                        marginBottom: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "blue",
                        }}
                      >{`${event.title}: ${event.description}`}</Text>
                    </View>
                  ))}
              </View>
            </View>
          </TouchableOpacity>
        ))} */

         // const handleAddEvent = () => {
  //   const selectedDay = new Date(newEventDate).getDate();
  //   const selectedHour = new Date(newEventDate).getHours();

  //   if (selectedDay !== null && selectedHour !== null) {
  //     const newEvent = {
  //       hour: selectedHour,
  //       title: newEventTitle || "New Event",
  //       description: newEventDescription,
  //       category: newEventCategory,
  //     };

  //     setEvents((prevEvents: any) => {
  //       const eventGroupIndex = prevEvents.findIndex(
  //         (group: any) => group.day === selectedDay
  //       );

  //       if (eventGroupIndex !== -1) {
  //         const updatedEvents = [...prevEvents];
  //         updatedEvents[eventGroupIndex].events.push(newEvent);
  //         return updatedEvents;
  //       } else {
  //         return [...prevEvents, { day: selectedDay, events: [newEvent] }];
  //       }
  //     });
  //     setIsAddEventModalVisible(false);
  //     setIsModalVisible(false);

  //     setNewEventDate(new Date());
  //     setNewEventTitle("");
  //     setNewEventDescription("");
  //     setNewEventCategory("Personal");
  //     setSelectedDate(null);

  //     const month = new Date(newEventDate).getMonth();
  //     const year = new Date(newEventDate).getFullYear();
  //     if (selectedDate !== null) {
  //       scheduleNotification(newEvent, selectedDate, month, year);
  //     }
  //   }
  // };

     /* <FlatList
        data={dates}
        renderItem={renderItem}
        keyExtractor={(item) => item.toString()}
        numColumns={7}
        contentContainerStyle={styles.gridContainer}
      /> */
      /* <View style={[styles.header, { paddingTop: insets.top }]}>
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
            </View> */