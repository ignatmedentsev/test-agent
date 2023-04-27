// Has a duplicate in the platform, keep consistent
export class PersonName {
  private ALPHABETIC_REPRESENTATION = 0;
  private COMPONENT_DELIMITER = '^';
  private GROUP_DELIMITER = '=';
  private LAST_NAME_COMPONENT = 0;
  private FIRST_NAME_COMPONENT = 1;
  private MIDDLE_NAME_COMPONENT = 2;
  private NAME_PREFIX_COMPONENT = 3;
  private NAME_SUFFIX_COMPONENT = 4;

  private rawValue = '';

  constructor(rawValue: string) {
    this.setRawValue(rawValue);
  }

  public setRawValue(rawValue: string) {
    this.rawValue = (typeof rawValue === 'string')
      ? rawValue
      : '';
  }

  public getRawValue() {
    return this.rawValue;
  }

  public getLastName() {
    return this.getComponent(this.ALPHABETIC_REPRESENTATION, this.LAST_NAME_COMPONENT);
  }

  public getFirstName() {
    return this.getComponent(this.ALPHABETIC_REPRESENTATION, this.FIRST_NAME_COMPONENT);
  }

  public getMiddleName() {
    return this.getComponent(this.ALPHABETIC_REPRESENTATION, this.MIDDLE_NAME_COMPONENT);
  }

  public getNamePrefix() {
    return this.getComponent(this.ALPHABETIC_REPRESENTATION, this.NAME_PREFIX_COMPONENT);
  }

  public getNameSuffix() {
    return this.getComponent(this.ALPHABETIC_REPRESENTATION, this.NAME_SUFFIX_COMPONENT);
  }

  public getData() {
    return {
      lastName: this.getLastName(),
      firstName: this.getFirstName(),
      middleName: this.getMiddleName(),
      prefixName: this.getNamePrefix(),
      suffixName: this.getNameSuffix(),
    };
  }

  private getComponent(groupId: number, componentId: number) {
    const group = this.getGroup(groupId);
    if (!group) {
      return;
    }

    const components = group.split(this.COMPONENT_DELIMITER);

    return components[componentId];
  }

  private getGroup(groupId: number) {
    const groups = this.rawValue.trim().split(this.GROUP_DELIMITER);

    return groups[groupId];
  }
}
