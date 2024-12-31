import { useState } from "react";
import { Box, TextField, Button, Grid, Alert } from "@mui/material";

const AddEventForm = ({ totalDuration, onAddEvent }) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // 시작 시간 검증
    const startSeconds = parseTimeToSeconds(startTime);
    if (startSeconds === null) {
      setError("올바른 시작 시간 형식을 입력해주세요 (MM:SS)");
      return;
    }

    // 종료 시간 검증 (있는 경우)
    let endSeconds = null;
    if (endTime) {
      endSeconds = parseTimeToSeconds(endTime);
      if (endSeconds === null) {
        setError("올바른 종료 시간 형식을 입력해주세요 (MM:SS)");
        return;
      }
      if (endSeconds <= startSeconds) {
        setError("종료 시간은 시작 시간보다 커야 합니다");
        return;
      }
    }

    // 전체 시간 범위 검증
    if (
      startSeconds > totalDuration ||
      (endSeconds && endSeconds > totalDuration)
    ) {
      setError("입력된 시간이 전체 타임라인 범위를 초과합니다");
      return;
    }

    // 설명 검증
    if (!description.trim()) {
      setError("설명을 입력해주세요");
      return;
    }

    // 이벤트 추가
    const newEvent = {
      startTime: startSeconds,
      endTime: endSeconds,
      description: description.trim(),
    };

    onAddEvent(newEvent);

    // 폼 초기화
    setStartTime("");
    setEndTime("");
    setDescription("");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="시작 시간 (MM:SS)"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            required
            placeholder="예: 05:00"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="종료 시간 (MM:SS)"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
            placeholder="예: 10:00"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="설명"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ height: "100%" }}
          >
            이벤트 추가
          </Button>
        </Grid>
      </Grid>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
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

export default AddEventForm;
