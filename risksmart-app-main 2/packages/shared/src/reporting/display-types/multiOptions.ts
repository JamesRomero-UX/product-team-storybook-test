export interface MultiOptionsFieldDefinition {
  displayType: 'multiOptions';
  /**
   * Retrieve list of possible options that can be selected
   * @returns
   */
  getOptions: () => { value: string; label: string }[];
}
