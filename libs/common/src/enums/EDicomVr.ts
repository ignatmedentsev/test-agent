export enum EDicomVr { // Do not rename file to EDicomVR. This cause start error in windows
  APPLICATION_ENTITY = 'AE', // String
  AGE_STRING = 'AS', // String
  ATTRIBUTE_TAG = 'AT', // String
  CODE_STRING = 'CS', // String
  DATE_VR = 'DA', // String
  DECIMAL = 'DS', // Number
  DATE_TIME = 'DT', // String
  FLOATING_POINT_SINGLE = 'FL', // Number
  FLOATING_POINT_DOUBLE = 'FD', // Number
  INTEGER_STRING = 'IS', // Number
  LONG_STRING = 'LO', // String
  LONG_TEXT = 'LT', // String
  OTHER_BYTE_STRING = 'OB', // Base64 encoded string
  OTHER_DOUBLE_STRING = 'OD', // Base64 encoded string
  OTHER_FLOAT_STRING = 'OF', // Base64 encoded string
  OTHER_WORD_STRING = 'OW', // Base64 encoded string
  PERSON_NAME = 'PN', // Object containing Person Name component groups as strings (see Section F.2.2)
  SHORT_STRING = 'SH', // String
  SIGNED_LONG = 'SL', // Number
  SEQUENCE = 'SQ', // Array containing DICOM JSON Objects
  SIGNED_SHORT = 'SS', // Number
  SHORT_TEXT = 'ST', // String
  TIME = 'TM', // String
  UID = 'UI', // String
  UNSIGNED_LONG = 'UL', // Number
  UNKNOWN = 'UN', // Base64 encoded string
  UNSIGNED_SHORT = 'US', // Number
  UNLIMITED_TEXT = 'UT', // String
}