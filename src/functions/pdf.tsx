import type { StudyPlanResponse } from "../types/studyPlanType";
import { Page, Text, View, Document, StyleSheet, Image, renderToStream } from '@react-pdf/renderer';
import imgLogo from "../assets/courseo-logo.png";

interface MyDocumentProps {
    studyPlan: StudyPlanResponse
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10, 
  },
  logo: {
    width: 68, 
    height: 68,
    objectFit: 'contain',
  },
   title: {
    fontSize: 68,
    fontWeight: 'extrabold',
    color: '#000181',
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000181',
    textAlign: 'center',
    marginBottom: 30,
  },
  yearTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000181',
    textAlign: 'center',
    marginVertical: 15,
  },
  sessionContainer: {
    marginBottom: 30,
    borderWidth: 3,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 8,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000181',
    marginBottom: 6,
    textAlign: 'center',
  },
  // Table Styling
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000181',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000181',
    alignItems: 'center',
    minHeight: 24,
  },
  tableHeaderRow: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    fontWeight: 'bold',
  },
  // Table Columns (adjust widths to sum up to 100%)
  colCode: {
    width: '25%',
    padding: 6,
  },
  colName: {
    width: '60%',
    padding: 6,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000181',
  },
  colCp: {
    width: '15%',
    padding: 6,
    textAlign: 'center',
  },
  cellHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000181',
  },
  cellText: {
    fontSize: 12,
    color: '#333333',
  },
});

// Create Document Component for pdf
const MyDocument = ({studyPlan} : MyDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
    <View style={styles.header}>
        <Image src={imgLogo} style={styles.logo} />
        <Text style={styles.title}>Courseo</Text>
    </View>
    <Text style={styles.subtitle}>Your UOW Study Plan</Text>
      {studyPlan?.plan?.map((yearData) => (
        <View key={yearData.year} wrap={false}>
          {/* Year Heading */}
          <Text style={styles.yearTitle}>Year {yearData.year}</Text>

          {yearData.sessions.map((sessionData) => (
            <View key={`${yearData.year}-${sessionData.session}`} style={[styles.sessionContainer, 
                sessionData.session === 'Autumn' ? {borderColor: '#83E7FF'} :  {borderColor: '#E8A0FF'}]} wrap={false}>
              {/* Session Heading */}
              <Text style={styles.sessionTitle}>{sessionData.session} Session</Text>

              {/* Subject Table */}
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeaderRow, 
                    sessionData.session === 'Autumn' ? {backgroundColor: 'rgba(131, 231, 255, 0.5)'} :  {backgroundColor: 'rgba(232, 160, 255, 0.5)'}]}>
                  <View style={styles.colCode}>
                    <Text style={styles.cellHeader}>Code</Text>
                  </View>
                  <View style={styles.colName}>
                    <Text style={styles.cellHeader}>Subject Name</Text>
                  </View>
                  <View style={styles.colCp}>
                    <Text style={styles.cellHeader}>CP</Text>
                  </View>
                </View>

                {/* Table Rows (Subjects) */}
                {sessionData.subjects.map((subject, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={styles.colCode}>
                      <Text style={styles.cellText}>{subject.code}</Text>
                    </View>
                    <View style={styles.colName}>
                      <Text style={styles.cellText}>{subject.name}</Text>
                    </View>
                    <View style={styles.colCp}>
                      <Text style={styles.cellText}>{subject.cp}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

export default MyDocument;

