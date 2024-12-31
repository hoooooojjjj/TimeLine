import { useState } from "react";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";

const TimelineHeader = ({ totalDuration, onDurationChange }) => {
  const [durationInput, setDurationInput] = useState(
    formatSeconds(totalDuration)
  );
  const [error, setError] = useState("");

  const handleDurationChange = () => {
    const seconds = parseTimeToSeconds(durationInput);
    if (seconds === null) {
      setError("올바른 시간 형식을 입력해주세요 (MM:SS)");
      return;
    }
    setError("");
    onDurationChange(seconds);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        타임라인 설정
      </Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="전체 시간 (MM:SS)"
          value={durationInput}
          onChange={(e) => setDurationInput(e.target.value)}
          size="small"
          sx={{ width: 150 }}
        />
        <Button variant="contained" onClick={handleDurationChange}>
          시간 설정
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

// 초를 MM:SS 형식으로 변환
const formatSeconds = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
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

export default TimelineHeader;
