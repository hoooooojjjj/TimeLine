import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Grid,
  Button,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import TimelineHeader from "./TimelineHeader";
import TimelineCanvas from "./TimelineCanvas";
import EventList from "./EventList";
import AddEventForm from "./AddEventForm";

const Timeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timelineName, setTimelineName] = useState("");
  const [totalDuration, setTotalDuration] = useState(1440);
  const [events, setEvents] = useState([]);
  const [canvasWidth, setCanvasWidth] = useState(2000);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);

  useEffect(() => {
    // 로컬 스토리지에서 타임라인 데이터 로드
    const timelineData = JSON.parse(localStorage.getItem(`timeline_${id}`));
    if (timelineData) {
      setTimelineName(timelineData.name);
      setTotalDuration(timelineData.totalDuration);
      setEvents(timelineData.events);
    }
  }, [id]);

  // 변경사항을 로컬 스토리지에 저장
  const saveTimeline = (updatedData = {}) => {
    const timelineData = {
      id,
      name: timelineName,
      totalDuration,
      events,
      ...updatedData,
    };
    localStorage.setItem(`timeline_${id}`, JSON.stringify(timelineData));

    // 타임라인 목록 업데이트
    const timelines = JSON.parse(localStorage.getItem("timelines") || "[]");
    const updatedTimelines = timelines.map((t) =>
      t.id === id ? { ...t, ...timelineData } : t
    );
    localStorage.setItem("timelines", JSON.stringify(updatedTimelines));
  };

  const handleDeleteTimeline = () => {
    if (window.confirm("이 타임라인을 삭제하시겠습니까?")) {
      const timelines = JSON.parse(localStorage.getItem("timelines") || "[]");
      const updatedTimelines = timelines.filter((t) => t.id !== id);
      localStorage.setItem("timelines", JSON.stringify(updatedTimelines));
      localStorage.removeItem(`timeline_${id}`);
      navigate("/");
    }
  };

  return (
    <Box>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate("/")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            {timelineName}
          </Typography>
          <IconButton color="error" onClick={handleDeleteTimeline}>
            <DeleteIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: "100%", margin: "0 auto", padding: 3 }}>
        <TimelineHeader
          totalDuration={totalDuration}
          onDurationChange={(duration) => {
            setTotalDuration(duration);
            saveTimeline({ totalDuration: duration });
          }}
        />
        <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="number"
              label="타임라인 너비 (px)"
              value={canvasWidth}
              onChange={(e) => setCanvasWidth(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 800, step: 100 }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="number"
              label="타임라인 높이 (px)"
              value={canvasHeight}
              onChange={(e) => setCanvasHeight(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 200, step: 50 }}
              size="small"
            />
          </Grid>
        </Grid>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            my: 2,
            maxHeight: "600px",
            overflowX: "auto",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "4px",
              "&:hover": {
                background: "#555",
              },
            },
          }}
        >
          <TimelineCanvas
            totalDuration={totalDuration}
            events={events}
            width={canvasWidth}
            height={canvasHeight}
            selectedEventIndex={selectedEventIndex}
          />
        </Paper>
        <AddEventForm
          totalDuration={totalDuration}
          onAddEvent={(newEvent) => {
            const updatedEvents = [...events, newEvent];
            setEvents(updatedEvents);
            saveTimeline({ events: updatedEvents });
          }}
        />
        <EventList
          events={events}
          selectedEventIndex={selectedEventIndex}
          onEventSelect={setSelectedEventIndex}
          onEditEvent={(index, updatedEvent) => {
            const updatedEvents = [...events];
            updatedEvents[index] = updatedEvent;
            setEvents(updatedEvents);
            saveTimeline({ events: updatedEvents });
          }}
          onDeleteEvent={(index) => {
            const updatedEvents = events.filter((_, i) => i !== index);
            setEvents(updatedEvents);
            saveTimeline({ events: updatedEvents });
            if (selectedEventIndex === index) {
              setSelectedEventIndex(null);
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default Timeline;
