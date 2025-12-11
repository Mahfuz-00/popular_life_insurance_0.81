import { StyleSheet } from 'react-native';

const globalStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },

  // Font Family Styles
  font: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  fontMedium: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins-Medium',
  },
  fontBold: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  fontFjallaOne: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'FjallaOne-Regular',
  },

  // Table & Text
  tableText: {
    fontSize: 14,
    color: '#056608',
    fontFamily: 'Poppins-Medium',
  },

  // Errors
  errorMessageText: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },

  // Bonus: Commonly used modern styles (optional but recommended)
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginVertical: 12,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default globalStyle;