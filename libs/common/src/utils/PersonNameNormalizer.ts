import { PersonName } from './PersonName';

// Has a duplicate in the platform, keep consistent
export class PersonNameNormalizer {
  private personName: PersonName;

  public constructor(personName: PersonName) {
    this.personName = personName;
    this.personName.setRawValue(this.trimRawPersonNameValue(this.personName.getRawValue()));
  }

  public normalize() {
    const nameComponents = this.clearNameComponents(this.getNameComponents());

    return new PersonName(nameComponents.join('^'));
  }

  private clearNameComponents(nameParts: string[]) {
    const regex = /[^a-zA-Zа-яёА-ЯЁ0-9\.\-\_\s\']/g;

    return nameParts
      .filter((part: string) => typeof part === 'string')
      .map((part: string) => part
        .replace(regex, '')
        .trim());
  }

  private getNameComponents() {
    const components = [];

    components.push(this.personName.getLastName() || '');
    components.push(this.personName.getFirstName() || '');
    components.push(this.personName.getMiddleName() || '');
    components.push(this.personName.getNamePrefix() || '');
    components.push(this.personName.getNameSuffix() || '');

    return components;
  }

  private trimRawPersonNameValue(rawValue: string) {
    let filteredValue = '';

    for (const char of rawValue) {
      if ([16].includes(char.charCodeAt(0))) {
        break;
      }
      filteredValue += char;
    }

    return filteredValue;
  }
}
