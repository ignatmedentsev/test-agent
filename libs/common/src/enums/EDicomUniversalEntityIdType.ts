export enum EDicomUniversalEntityIdType {
  DNS = 'DNS',
  EUI64 = 'EUI64',
  ISO = 'ISO',
  URI = 'URI',
  UUID = 'UUID',
  X400 = 'X400',
  X500 = 'X500',
}

export enum EDicomUniversalEntityIdTypeLabel {
  DNS = 'An Internet dotted name. Either in ASCII or as integers',
  EUI64 = 'EUI64An IEEE Extended Unique Identifier',
  ISO = 'An International Standards Organization Object Identifier',
  URI = 'Uniform Resource Identifier',
  UUID = 'The DCE Universal Unique Identifier',
  X400 = 'An X.400 MHS identifier',
  X500 = 'An X.500 directory name',
}
