import {
  Box,
  List,
  ListItem,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const EventList = ({
  events,
  selectedEventIndex,
  onEventSelect,
  onEditEvent,
  onDeleteEvent,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    startTime: "",
    endTime: "",
    description: "",
  });

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const handleEditClick = (event, index) => {
    setEditingEvent(event);
    setEditIndex(index);
    setEditForm({
      startTime: formatTime(event.startTime),
      endTime: event.endTime ? formatTime(event.endTime) : "",
      description: event.description,
    });
    setEditDialogOpen(true);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        이벤트 목록
      </Typography>
      <Paper elevation={2}>
        <List sx={{ p: 0 }}>
          {events.map((event, index) => (
            <ListItem
              key={index}
              sx={{
                borderBottom: "1px solid #eee",
                transition: "all 0.2s ease",
                backgroundColor:
                  selectedEventIndex === index
                    ? "rgba(33, 150, 243, 0.08)"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                cursor: "pointer",
                p: 2,
              }}
              onClick={() =>
                onEventSelect(index === selectedEventIndex ? null : index)
              }
            >
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}
                  >
                    {event.description}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(event, index);
                      }}
                      sx={{ color: "#666" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEvent(index);
                      }}
                      sx={{ color: "#666" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: "#666" }} />
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </Typography>
                  <Chip
                    label={event.endTime ? "구간" : "포인트"}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.75rem",
                      backgroundColor: event.endTime ? "#e3f2fd" : "#fce4ec",
                      color: event.endTime ? "#1565c0" : "#c2185b",
                    }}
                  />
                </Stack>
              </Stack>
            </ListItem>
          ))}
          {events.length === 0 && (
            <ListItem sx={{ py: 4 }}>
              <Typography
                variant="body1"
                sx={{
                  width: "100%",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                등록된 이벤트가 없습니다
              </Typography>
            </ListItem>
          )}
        </List>
      </Paper>

      {/* 수정 다이얼로그 */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>이벤트 수정</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField
              label="시작 시간 (MM:SS)"
              value={editForm.startTime}
              onChange={(e) =>
                setEditForm({ ...editForm, startTime: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="종료 시간 (MM:SS)"
              value={editForm.endTime}
              onChange={(e) =>
                setEditForm({ ...editForm, endTime: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="설명"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button
            onClick={() => {
              const updatedEvent = {
                startTime: parseTimeToSeconds(editForm.startTime),
                endTime: editForm.endTime
                  ? parseTimeToSeconds(editForm.endTime)
                  : null,
                description: editForm.description,
              };
              onEditEvent(editIndex, updatedEvent);
              setEditDialogOpen(false);
            }}
            variant="contained"
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// MM:SS 형식을 초로 변환
const parseTimeToSeconds = (timeString) => {
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  if (seconds >= 60) return null;
  return minutes * 60 + seconds;
};

export default EventList;
