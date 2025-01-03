import { useEffect, useRef } from "react";

const TimelineCanvas = ({
  totalDuration,
  events,
  width: canvasWidth = 2000,
  height: canvasHeight = 400,
  selectedEventIndex = null,
}) => {
  const canvasRef = useRef(null);

  // 고유한 색상 생성을 위한 함수
  const generateEventColor = (index) => {
    const colors = [
      ["#2196f3", "#64b5f6"], // 파랑
      ["#4caf50", "#81c784"], // 초록
      ["#f44336", "#e57373"], // 빨강
      ["#9c27b0", "#ba68c8"], // 보라
      ["#ff9800", "#ffb74d"], // 주황
      ["#009688", "#4db6ac"], // 청록
      ["#673ab7", "#9575cd"], // 진보라
      ["#3f51b5", "#7986cb"], // 남색
      ["#e91e63", "#f06292"], // 분홍
      ["#fdd835", "#fff176"], // 노랑
    ];
    return colors[index % colors.length];
  };

  // 시간 포맷팅 함수 추가
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 레티나 디스플레이 대응
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    const width = canvasWidth;
    const height = canvasHeight;
    const timelineY = height * 0.3;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw timeline background
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(40, timelineY - 15, width - 80, 30);

    // Draw timeline
    ctx.beginPath();
    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 2;
    ctx.moveTo(50, timelineY);
    ctx.lineTo(width - 50, timelineY);
    ctx.stroke();

    // Draw time markers
    const interval = 60;
    const majorInterval = 300;

    for (let t = 0; t <= totalDuration; t += interval) {
      const x = map(t, 0, totalDuration, 50, width - 50);

      if (t % majorInterval === 0) {
        ctx.beginPath();
        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 2;
        ctx.moveTo(x, timelineY - 10);
        ctx.lineTo(x, timelineY + 10);
        ctx.stroke();

        const minutes = Math.floor(t / 60);
        const seconds = t % 60;
        ctx.fillStyle = "#1976d2";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
            2,
            "0"
          )}`,
          x,
          timelineY - 20
        );
      } else {
        ctx.beginPath();
        ctx.strokeStyle = "#90caf9";
        ctx.lineWidth = 1;
        ctx.moveTo(x, timelineY - 5);
        ctx.lineTo(x, timelineY + 5);
        ctx.stroke();
      }
    }

    // 레이블 설정 수정
    const labelHeight = 45; // 레이블 높이 증가
    const labelPadding = 30;
    const usedSpaces = new Map();

    // 이벤트 정렬
    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);

    // Draw events and labels
    sortedEvents.forEach((event, index) => {
      const xStart = map(event.startTime, 0, totalDuration, 50, width - 50);
      const [colorStart, colorEnd] = generateEventColor(index);
      const isSelected = index === selectedEventIndex;

      // 선택된 이벤트 하이라이트 효과
      if (isSelected) {
        ctx.shadowColor = colorStart;
        ctx.shadowBlur = 15;
      }

      // 이벤트 라인/포인트 그리기
      if (event.endTime) {
        const xEnd = map(event.endTime, 0, totalDuration, 50, width - 50);
        const gradient = ctx.createLinearGradient(
          xStart,
          timelineY,
          xEnd,
          timelineY
        );
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isSelected ? 8 : 6;
        ctx.lineCap = "round";
        ctx.moveTo(xStart, timelineY);
        ctx.lineTo(xEnd, timelineY);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.fillStyle = colorStart;
        ctx.arc(xStart, timelineY, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 그림자 효과 초기화
      ctx.shadowBlur = 0;

      // 레이블 위치 계산
      ctx.font =
        '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      const descriptionWidth = ctx.measureText(event.description).width;

      // 시간 텍스트 준비
      const timeText = event.endTime
        ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
        : formatTime(event.startTime);
      ctx.font =
        '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      const timeWidth = ctx.measureText(timeText).width;

      // 레이블 너비 계산 (설명과 시간 중 더 긴 것 기준)
      const labelWidth = Math.max(descriptionWidth, timeWidth) + 24;

      let level = 1;
      let labelY = timelineY + 40;
      let overlapping = true;

      while (overlapping) {
        overlapping = false;
        const currentY = labelY + (level - 1) * (labelHeight + labelPadding);
        const labelLeft = xStart - labelWidth / 2;
        const labelRight = xStart + labelWidth / 2;

        for (const [usedX, usedLevel] of usedSpaces.entries()) {
          if (usedLevel === level) {
            const usedLeft = usedX - labelWidth / 2;
            const usedRight = usedX + labelWidth / 2;
            if (!(labelRight < usedLeft - 10 || labelLeft > usedRight + 10)) {
              overlapping = true;
              break;
            }
          }
        }

        if (overlapping) {
          level++;
        }
      }

      usedSpaces.set(xStart, level);
      const finalY = labelY + (level - 1) * (labelHeight + labelPadding);

      // 연결선 그리기
      ctx.beginPath();
      ctx.strokeStyle = colorStart;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(xStart, timelineY + 5);
      ctx.lineTo(xStart, finalY - labelHeight / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 레이블 배경
      const labelRadius = 6;
      ctx.beginPath();
      if (isSelected) {
        const rgb = hexToRgb(colorStart);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
      } else {
        ctx.fillStyle = "#ffffff";
      }
      roundRect(
        ctx,
        xStart - labelWidth / 2,
        finalY - labelHeight / 2,
        labelWidth,
        labelHeight,
        labelRadius
      );
      ctx.fill();

      // 설명 텍스트
      ctx.fillStyle = "#333333";
      ctx.font =
        '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(event.description, xStart, finalY - 8);

      // 시간 텍스트
      ctx.fillStyle = "#666666";
      ctx.font =
        '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      ctx.fillText(timeText, xStart, finalY + 8);
    });
  }, [totalDuration, events, canvasWidth, canvasHeight, selectedEventIndex]);

  // 둥근 사각형 그리기 함수
  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // HEX 색상을 RGB 객체로 변환하는 유틸리티 함수
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  return (
    <div
      style={{
        width: "100%",
        maxHeight: "600px",
        overflowX: "auto",
        overflowY: "auto",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        padding: "20px 0",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          height: `${canvasHeight}px`,
          width: `${canvasWidth}px`,
        }}
      />
    </div>
  );
};

const map = (value, start1, stop1, start2, stop2) => {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
};

export default TimelineCanvas;
