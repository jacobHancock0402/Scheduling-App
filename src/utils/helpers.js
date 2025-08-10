// Helper functions for the app

export const formatTime = (seconds) => {
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(seconds / 3600);
  const days = Math.round(seconds / (24 * 3600));

  if (days > 0) {
    return `${days} Days`;
  } else if (hours > 0) {
    return `${hours} Hours`;
  } else if (minutes > 0) {
    return `${minutes} Minutes`;
  } else {
    return `${seconds} Seconds`;
  }
};

export const limitValue = (upperLimit, lowerLimit, value) => {
  return Math.max(lowerLimit, Math.min(upperLimit, value));
};

export const parseRGB = (rgbString) => {
  const match = rgbString.match(/\d+/g);
  if (match && match.length >= 2) {
    return {
      red: parseInt(match[0]),
      green: parseInt(match[1]),
      blue: match[2] ? parseInt(match[2]) : 0
    };
  }
  return { red: 0, green: 0, blue: 0 };
};

export const createRGBString = (red, green, blue = 0) => {
  return `rgb(${red},${green},${blue})`;
};

export const calculateSM2Score = (changeValue) => {
  return 5 * (changeValue / 255);
};

export const calculateEasingFactor = (currentEf, sm2Score) => {
  return Math.max(1.3, currentEf + (0.1 - (5 - sm2Score) * (0.08 + (5 - sm2Score) * 0.02)));
};

export const getNextInterval = (currentIntervals, nextRep, easingFactor) => {
  if (nextRep < 4) {
    return currentIntervals[nextRep - 1];
  }
  return currentIntervals[nextRep - 1] * easingFactor;
}; 