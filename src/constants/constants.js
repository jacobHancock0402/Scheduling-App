// App constants and configuration

export const TIME_CONVERSIONS = {
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 3600,
  SECONDS_PER_DAY: 86400,
  SECONDS_PER_WEEK: 604800,
  MILLISECONDS_PER_DAY: 86400000,
};

export const COLOUR_CONSTANTS = {
  MAX_RGB: 255,
  MIN_RGB: 0,
  DEFAULT_GREEN: 'rgb(0,255,0)',
  DEFAULT_RED: 'rgb(255,0,0)',
  DEFAULT_BLUE: 'rgb(0,0,255)',
  DEFAULT_YELLOW: 'rgb(255,255,0)',
};

export const SM2_CONSTANTS = {
  DEFAULT_EFACTOR: 2.5,
  MIN_EFACTOR: 1.3,
  DEFAULT_INTERVAL: 1,
  DEFAULT_NEXT_REP: 1,
  DEFAULT_INTERVALS: { 1: 1, 2: 6 },
  SCORE_MULTIPLIER: 5,
  SCORE_THRESHOLD: 3,
  EFACTOR_ADJUSTMENT: 0.1,
  EFACTOR_MULTIPLIER: 0.08,
  EFACTOR_ADDITIONAL: 0.02,
};

export const DAMPING_FACTOR = 0.7;

export const CONVERSION_FACTORS = {
  SUBJECT_DECAY: 255 / (2 * 60 * 60 * 24 * 7), // 1 week
  TOPIC_DECAY: 255 / (2 * 60 * 60 * 24), // 1 day
  SM2_CONVERSION: 255 / (60 * 60 * 24), // 1 day
};

export const MONTHS = {
  0: 'January', 1: 'February', 2: 'March', 3: 'April', 4: 'May', 5: 'June',
  6: 'July', 7: 'August', 8: 'September', 9: 'October', 10: 'November', 11: 'December'
};

export const DAYS = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

export const STORAGE_KEYS = {
  TOPICS: 'topics',
  TIME_START: 'timeStart',
};

export const DEFAULT_TOPIC_CONFIG = {
  subjects: [],
  topics: [],
  parent: null,
  colour: COLOUR_CONSTANTS.DEFAULT_GREEN,
  name: '',
};

export const DEFAULT_SUBTOPIC_CONFIG = {
  name: [],
  timeStart: 0,
  colour: COLOUR_CONSTANTS.DEFAULT_RED,
  changeColour: COLOUR_CONSTANTS.DEFAULT_GREEN,
  parent: '',
  sm2_conversion: CONVERSION_FACTORS.SM2_CONVERSION,
  interval: SM2_CONSTANTS.DEFAULT_INTERVAL,
  sm2_timeStart: Date.now(),
  efactor: SM2_CONSTANTS.DEFAULT_EFACTOR,
  nextRep: SM2_CONSTANTS.DEFAULT_NEXT_REP,
  intervals: SM2_CONSTANTS.DEFAULT_INTERVALS,
  sm2_colour: COLOUR_CONSTANTS.DEFAULT_GREEN,
  displayedColour: COLOUR_CONSTANTS.DEFAULT_GREEN,
}; 