import React, { Component, Fragment } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import axios from "axios";

import {
  makeStyles,
  MuiThemeProvider,
  createMuiTheme
} from "@material-ui/core/styles";
import {
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";
import { green, purple, red, orange } from "@material-ui/core/colors";

import moment from "moment";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));

class CalendarForBooking extends Component {
  state = {
    calendarEvents: [],
    courses: {},
    course_id: null,
    startDay: 4,
    mobile: false,
    teacher: {},
    eventSelected: false,
    courseSelected: false,
    submitBackgroundColor: false
  };

  calendarRef = React.createRef();

  getCalendarEvents = () => {
    axios(`/api/teachers/${this.props.teacherID.teacher}`, {
      method: "get",
      withCredentials: true
    }).then(({ data }) => {
      const lessons = JSON.parse(data.lessons);
      const teacher = data.teachers[0];

      let loadedEvents = [];
      for (let i in data.timeslots) {
        const startTime = data.timeslots[i].datetime;
        loadedEvents.push({
          title: "Available",
          start: moment(startTime).toDate(),
          end: moment(startTime)
            .add(30, "m")
            .toDate(),
          id: data.timeslots[i].id
        });
      }

      for (let i in lessons) {
        const timeslots = lessons[i].timeslots;
        const startTime = timeslots[0].datetime;

        const lastTimeslot = timeslots[timeslots.length - 1];
        const endTime = moment(lastTimeslot.datetime)
          .add(30, "m")
          .toDate();

        if (!timeslots[0].is_booked) {
          loadedEvents.push({
            title: "Pending lesson",
            start: moment(startTime).toDate(),
            end: endTime,
            id: lessons[i].id,
            backgroundColor: "orange",
            borderColor: "orange"
          });
        } else {
          loadedEvents.push({
            title: "Lesson",
            start: moment(startTime).toDate(),
            end: endTime,
            id: lessons[i].id,
            backgroundColor: "green",
            borderColor: "green"
          });
        }
      }

      let courses = {};
      for (let course of data.courses) {
        const courseName = course.instrument + " - " + course.level;
        courses[courseName] = course.id;
      }

      let mobile = false;
      if (window.innerWidth < 680) {
        mobile = true;
      }

      let startDay = moment().isoWeekday();

      const useStyles = makeStyles(theme => ({
        formControl: {
          margin: theme.spacing(1),
          minWidth: 120
        },
        selectEmpty: {
          marginTop: theme.spacing(2)
        }
      }));

      this.setState({
        calendarEvents: loadedEvents,
        courses,
        startDay,
        mobile,
        teacher
      });
    });
  };

  componentDidMount() {
    this.getCalendarEvents();
  }

  submitBookings = e => {
    // Send requested bookings to server
    e.preventDefault();
    if (this.state.submitBackgroundColor) {
      const events = this.state.calendarEvents;

      let requests = [];
      for (let event of events) {
        if (event.title === "Booking Request") {
          requests.push(event);
        }
      }

      const sortedRequests = requests.sort((a, b) => {
        return moment(a.start).diff(moment(b.start));
      });

      // Only send timeslots which have a booking request
      let checkValidTimeslots = true;
      for (let i = 0; i < sortedRequests.length - 1; i++) {
        if (
          moment(sortedRequests[Number(i) + 1].start).diff(
            moment(sortedRequests[i].start)
              .add(30, "m")
              .toDate()
          )
        ) {
          alert("Please request one lesson at a time.");
          return (checkValidTimeslots = false);
        }
      }

      if (checkValidTimeslots) {
        axios(`/api/lessons`, {
          method: "post",
          withCredentials: true,
          data: {
            lesson: {
              timeslots: sortedRequests.map(request => {
                return request.id;
              }),
              course_id: this.state.course_id
            }
          }
        });
      }
    }
  };

  activeSubmit = (eventSelected, courseSelected) => {
    return eventSelected && courseSelected;
  };

  selectCourse = e => {
    this.setState({
      course_id: this.state.courses[e.target.value],
      courseSelected: true,
      submitBackgroundColor: this.activeSubmit(this.state.eventSelected, true)
        ? true
        : false
    });
  };

  requestBooking = arg => {
    let eventId = Number(arg.event.id);
    let events = [...this.state.calendarEvents];
    let newEvents = [];

    // Must create a copy of the event for state to update
    for (let event of events) {
      let newEvent = { ...event };
      if (event.id === eventId && event.title === "Available") {
        newEvent = {
          ...event,
          title: "Booking Request",
          backgroundColor: "green",
          borderColor: "green"
        };
      }
      if (event.id === eventId && event.title === "Available") {
        newEvent = {
          ...event,
          title: "Booking Request",
          backgroundColor: "green",
          borderColor: "green"
        };
      }
      newEvents.push(newEvent);
    }

    this.setState({
      calendarEvents: newEvents,
      eventSelected: true,
      submitBackgroundColor: this.activeSubmit(true, this.state.courseSelected)
        ? true
        : false
    });
  };

  render() {
    return (
      <Fragment>
        <Card className={"repeat-card"}>
          <CardContent>
            <Typography variant="h5" className={"repeat-card-title"}>
              Request a Lesson - {this.state.teacher.first_name}{" "}
              {this.state.teacher.last_name}
            </Typography>
            <Typography variant="body2" className={"repeat-card-title"}>
              Select availabilities in the calendar, select a course and hit
              submit!
            </Typography>
            <Grid
              container
              direction="row"
              alignItems={"center"}
              style={{ display: "flex" }}
            >
              <Grid item style={{ marginRight: 30 }}>
                <TextField
                  select
                  fullWidth
                  label="Courses"
                  variant="outlined"
                  value={this.state.course}
                  style={{ minWidth: 200 }}
                  onChange={e => this.selectCourse(e)}
                >
                  {Object.keys(this.state.courses).map((course, i) => {
                    return (
                      <MenuItem value={course} key={i}>
                        {course}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid item>
                <Button
                  onClick={this.submitBookings}
                  variant={"contained"}
                  style={{
                    backgroundColor: this.state.submitBackgroundColor
                      ? "green"
                      : "grey"
                  }}
                >
                  Request a Lesson
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            {this.state.mobile && (
              <FullCalendar
                ref={this.calendarRef}
                events={this.state.calendarEvents}
                defaultView="timeGrid"
                header={{
                  left: "prev today",
                  right: "next"
                }}
                plugins={[timeGridPlugin, interactionPlugin]}
                firstDay={this.state.startDay}
                minTime={"08:00:00"}
                aspectRatio={0.7}
                allDaySlot={false}
                eventClick={this.requestBooking}
              />
            )}
            {!this.state.mobile && (
              <FullCalendar
                ref={this.calendarRef}
                events={this.state.calendarEvents}
                defaultView="timeGridWeek"
                header={{
                  left: "prev today",
                  center: "title",
                  right: "next"
                }}
                plugins={[timeGridPlugin, interactionPlugin]}
                firstDay={this.state.startDay}
                minTime={"08:00:00"}
                aspectRatio={1.8}
                allDaySlot={false}
                eventClick={this.requestBooking}
              />
            )}
          </CardContent>
        </Card>
      </Fragment>
    );
  }
}

export default CalendarForBooking;
