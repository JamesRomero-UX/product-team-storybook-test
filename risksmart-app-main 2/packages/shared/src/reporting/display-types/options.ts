export interface OptionsFieldDefinition {
  displayType: 'options';
  /**
   * Retrieve list of possible options that can be selected
   * @returns
   */
  getOptions: () => { value: string; label: string }[];
}
