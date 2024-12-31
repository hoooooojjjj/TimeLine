import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const TimelineList = () => {
  const [timelines, setTimelines] = useState([]);
  const [newTimelineDialog, setNewTimelineDialog] = useState(false);
  const [newTimelineName, setNewTimelineName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 로컬 스토리지에서 타임라인 목록 로드
    const savedTimelines = JSON.parse(
      localStorage.getItem("timelines") || "[]"
    );
    setTimelines(savedTimelines);
  }, []);

  const handleCreateTimeline = () => {
    if (!newTimelineName.trim()) return;

    const newTimeline = {
      id: Date.now().toString(),
      name: newTimelineName.trim(),
      createdAt: new Date().toISOString(),
      totalDuration: 1440,
      events: [],
    };

    const updatedTimelines = [...timelines, newTimeline];
    setTimelines(updatedTimelines);
    localStorage.setItem("timelines", JSON.stringify(updatedTimelines));
    localStorage.setItem(
      `timeline_${newTimeline.id}`,
      JSON.stringify(newTimeline)
    );

    setNewTimelineDialog(false);
    setNewTimelineName("");
    navigate(`/timeline/${newTimeline.id}`);
  };

  const handleDeleteTimeline = (id) => {
    if (window.confirm("이 타임라인을 삭제하시겠습니까?")) {
      const updatedTimelines = timelines.filter((t) => t.id !== id);
      setTimelines(updatedTimelines);
      localStorage.setItem("timelines", JSON.stringify(updatedTimelines));
      localStorage.removeItem(`timeline_${id}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          타임라인 목록
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewTimelineDialog(true)}
        >
          새 타임라인
        </Button>
      </Box>

      <Grid container spacing={3}>
        {timelines.map((timeline) => (
          <Grid item xs={12} sm={6} md={4} key={timeline.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {timeline.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  생성일: {new Date(timeline.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  이벤트 수: {timeline.events.length}개
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/timeline/${timeline.id}`)}
                >
                  열기
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteTimeline(timeline.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={newTimelineDialog}
        onClose={() => setNewTimelineDialog(false)}
        maxWidth="sm" // 모달의 최대 너비를 설정
        fullWidth // 모달이 전체 너비를 차지하도록 설정
      >
        <DialogTitle>새 타임라인 만들기</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="타임라인 이름"
            fullWidth
            value={newTimelineName}
            onChange={(e) => setNewTimelineName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTimelineDialog(false)}>취소</Button>
          <Button onClick={handleCreateTimeline} variant="contained">
            만들기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimelineList;
