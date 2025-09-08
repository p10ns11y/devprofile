import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Link } from '@react-pdf/renderer';
import data from '../data/cvdata.json';

const styles = StyleSheet.create({
  page: { padding: 12, fontFamily: 'Helvetica', lineHeight: 1 },
  header: { fontSize: 20, textAlign: 'center', marginBottom: 5 },
  contactLine: { fontSize: 9, textAlign: 'center', marginBottom: 6, color: '#666' },
  subheader: { fontSize: 14, marginBottom: 4, fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: 2 },
  text: { fontSize: 8, marginBottom: 1, textAlign: 'justify' },
  listItem: { fontSize: 10, marginLeft: 8, marginBottom: 1, textAlign: 'justify' },
  columnContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  leftColumn: { width: '60%', marginRight: 3 },
  rightColumn: { width: '37%' },
  section: { marginBottom: 6 },
  technologies: { columns: 2, columnGap: 8 },
  compactList: { fontSize: 9, marginLeft: 6, marginBottom: 1 },
  jobTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 1 },
  jobDetails: { fontSize: 10, color: '#555', marginBottom: 1 },
  link: { color: '#666', textDecoration: 'none' },
  rightColumnText: { fontSize: 9, marginBottom: 1, textAlign: 'justify' },
  rightColumnList: { fontSize: 9, marginBottom: 1, textAlign: 'justify' },
  headerTimes: { fontSize: 20, textAlign: 'center', marginBottom: 5, fontFamily: 'Times-Roman' },
  leftHeaderHelvetica: { fontSize: 14, marginBottom: 4, fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: 2, fontFamily: 'Helvetica' },
  technologiesCourier: { fontSize: 9, marginBottom: 1, textAlign: 'justify', fontFamily: 'Helvetica' },
  rightSectionsSymbol: { fontSize: 9, marginBottom: 1, textAlign: 'justify', fontFamily: 'Helvetica' },
  dateZapfDingbats: { fontSize: 10, color: '#555', marginBottom: 1, fontFamily: 'Helvetica' },
});

const CVDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.headerTimes}>{data.name}</Text>
      <Text style={{ fontSize: 12, textAlign: 'center', marginBottom: 3, color: '#777' }}>Senior Software Engineer</Text>
      <Text style={styles.contactLine}>
        <Link src={`mailto:${data.contact.email}?subject=Contact from CV`} style={styles.link}>{data.contact.email}</Link> | <Link src={`tel:${data.contact.phone}`} style={styles.link}>{data.contact.phone}</Link> | {data.contact.citizenship}
      </Text>
      <Text style={styles.contactLine}>
        <Link src="https://github.com/p10ns11y" style={styles.link}>github.com/p10ns11y</Link> | <Link src="https://x.com/peramanathan" style={styles.link}>x.com/peramanathan</Link>
      </Text>
      <View style={styles.section}>
        <Text style={styles.subheader}>Profile</Text>
        <Text style={[styles.text, {fontSize: 10}]}>{data.profile}</Text>
      </View>
      <View style={styles.columnContainer}>
        <View style={styles.leftColumn}>
          <Text style={styles.leftHeaderHelvetica}>Work Experience</Text>
          {data.work_experience.map((job, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <Text style={styles.jobTitle}>{job.title} | {job.company}, {job.location}</Text>
              <Text style={styles.dateZapfDingbats}>{job.start_date} - {job.end_date}</Text>
              {job.responsibilities.map((resp, i) => <Text key={i} style={styles.compactList}>* {resp}</Text>)}
              <Text style={[styles.text, { fontStyle: 'italic' }]}>Tools: {job.tools.join(', ')}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.rightColumn, { height: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}]}>
          <View>
            <Text style={styles.subheader}>Skills</Text>
            {/** @ts-ignore */}
            <Text style={[styles.rightSectionsSymbol, { fontWeight: 'bold' }]}>Product: <Text style={{ display: 'inline', fontWeight: 'normal' }}>{data.skills.product.join(', ')}</Text></Text>
            {/** @ts-ignore */}
            <Text style={[styles.rightSectionsSymbol, { fontWeight: 'bold' }]}>Development: <Text style={{ display: 'inline', fontWeight: 'normal' }}>{data.skills.practices.join(', ')}</Text></Text>

            <Text style={styles.subheader}>Technologies</Text>
            <View>
              {Object.entries(data.technologies).map(([cat, items], i) => (
                <Text key={i} style={[styles.technologiesCourier, { marginBottom: 2, fontWeight: 'bold' }]}>
                  {/** @ts-ignore */}
                  {cat}: <Text style={{ display: 'inline', fontWeight: 'normal' }}>{items.join(', ')}</Text>
                </Text>
              ))}
            </View>  
          </View>

          <View>
            <Text style={styles.subheader}>Projects</Text>
            {data.projects.map((project, index) => (
              <View key={index}>
                 <Link src={project.url} style={[styles.link, { fontSize: 9 }]}>{project.name}</Link>
                {/** @ts-ignore */}
                 <Text style={{ display: 'inline', fontSize: 8, marginLeft: 5 }}>{project.description}</Text>
              </View>
            ))}

            <Text style={styles.subheader}>Publications</Text>
            {data.publications.map((pub, i) => <Text key={i} style={[styles.rightColumnList, { fontFamily: 'Helvetica' }]}>{pub}</Text>)}

            <Text style={styles.subheader}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{edu.degree}</Text>
                <Text style={styles.rightSectionsSymbol}>{edu.institution}</Text>
              </View>
            ))}

            <Text style={styles.subheader}>Languages</Text>
            {Object.entries(data.languages).map(([lang, level], i) => <Text key={i} style={styles.rightSectionsSymbol}>{lang}: {level}</Text>)}
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default CVDocument;