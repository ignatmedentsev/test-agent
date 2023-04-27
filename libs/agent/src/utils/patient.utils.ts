export function getPatientAge(dateOfBirth: Date, dateOfService: Date) {
  if (!dateOfBirth || !dateOfService) {
    return null;
  }

  const serviceDate = new Date(dateOfService);
  const birthDate = new Date(dateOfBirth);

  const m = serviceDate.getMonth() - birthDate.getMonth();

  let age = serviceDate.getFullYear() - birthDate.getFullYear();
  if (m < 0 || (m === 0 && serviceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
