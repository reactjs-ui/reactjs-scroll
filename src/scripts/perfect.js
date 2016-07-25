const perfect = {
  /**
   * getStyles
   * @param {type} element
   * @param {type} property
   * @returns {styles}
   */
  getStyles: (element, property) => {
    const styles = element.ownerDocument.defaultView.getComputedStyle(element, null);
    if (property) {
      return styles.getPropertyValue(property) || styles[property];
    }
    return styles;
  }

};

export default perfect;
