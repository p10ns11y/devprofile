import { 
  Document, 
  Page, 
  Text,
  View,
  StyleSheet,
  Link,
  Font,
  Svg,
  Path
} from '@react-pdf/renderer';
import data from '@/data/cvdata.json';

Font.register({
  family: 'Helvetica',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Helvetica/Helvetica.ttf',
});
Font.register({
  family: 'Helvetica-Bold',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Helvetica/Helvetica-Bold.ttf',
});
Font.register({
  family: 'Times-Roman',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Times/Times-Roman.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: '10 25',
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.3,
    color: '#333',
  },
  header: {
    fontFamily: 'Times-Roman',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 6,
    color: '#000',
  },
  title: {
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 8,
    color: '#555',
  },
  contactLine: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    fontSize: 9,
    textAlign: 'center',
    paddingVertical: 2,
    color: '#666',
  },
  subheader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 5,
    marginTop: 8,
    borderBottom: 1,
    borderColor: '#ddd',
    paddingBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#444',
  },
  text: {
    fontSize: 9,
    marginBottom: 3,
    textAlign: 'left',
    hyphens: 'auto',
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 3,
    textAlign: 'left',
  },
  bullet: {
    width: 8,
    fontSize: 9,
    marginRight: 4,
    color: '#333',
  },
  listText: {
    flex: 1,
    fontSize: 9,
    color: '#333',
  },
  columnContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  leftColumn: {
    width: '61.818182%',
    paddingRight: 12,
  },
  rightColumn: {
    width: '38.181818%',
    paddingLeft: 6,
    borderLeft: 1,
    borderColor: '#eee',
    // paddingBottom: 20
  },
  section: {
    marginBottom: 8,
  },
  technologyCategory: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginBottom: 2,
    color: '#444',
  },
  technologyList: {
    fontSize: 9,
    color: '#666',
  },
  jobTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 2,
    color: '#333',
  },
  jobDate: {
    fontSize: 9,
    color: '#666',
    marginBottom: 3,
  },
  tools: {
    fontSize: 8,
    color: '#646464',
    fontStyle: 'italic',
    marginTop: 1,
  },
  link: {
    color: '#646464',
    textDecoration: 'none',
  },
  rightSectionText: {
    fontSize: 9,
    marginBottom: 3,
    color: '#333',
  },
  rightSectionBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#444',
  },
  projectItem: {
    marginBottom: 3,
  },
  publicationItem: {
    marginBottom: 4,
  },
  educationItem: {
    marginBottom: 4,
  },
});

const CVDocument = () => (
  <Document
    title="Peramanathan Sathyamoorthy - Curriculum Vitae"
    author="Peramanathan Sathyamoorthy"
    subject="Professional Resume for Senior Software Engineer"
    keywords="Software Engineer, JavaScript, TypeScript, ReactJS, Python, Full-Stack Development, Team Leadership"
    creator="Peramanathan Sathyamoorthy, grok-code-fast1, xAI Grok"
    producer="react-pdf"
    pdfVersion="1.7"
    language="en-US"
    pageMode="useOutlines"
    pageLayout="singlePage"
  >
    {/* @ts-ignore */}
    <Page size="A4" orientation="portrait" dpi={300} style={styles.page} bookmark="Table of Contents">
      {/* @ts-ignore */}
      <View bookmark="Header">
        <Text style={styles.header}>{data.name}</Text>
        <Text style={styles.title}>{data.latest_proffessional_role}</Text>
        <View style={styles.contactLine}>
          <Link src={`mailto:${data.contact.email}`} style={styles.link}>{data.contact.email}</Link>
          <Link src={`tel:${data.contact.phone}`} style={[styles.link, { paddingLeft: 4 }]}>{data.contact.phone}</Link>
          <Text style={{ paddingLeft: 4 }}>{data.contact.citizenship}</Text>
        </View>
        <View style={styles.contactLine}>
          <View style={{ display: 'flex' }}>
            <Link src={data.cv_social_links.x} style={[styles.link, { flexDirection: 'row', alignItems: 'center' }]}>
              <Svg width="12" height="12" viewBox="0 0 24 24">
                <Path fill="#646464" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </Svg>
              <Text style={{ paddingLeft: 2 }}>
                {data.cv_social_links.github}
              </Text>
            </Link> 
          </View>
          <View style={{ display: 'flex' }}>
            <Link src={data.cv_social_links.x} style={[styles.link, { paddingLeft: 10, flexDirection: 'row', alignItems: 'center' }]}>
              <Svg width="10" height="10" viewBox="0 0 24 24" >
                <Path fill="#646464" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </Svg>
              <Text style={{ paddingLeft: 2 }}>
                {data.cv_social_links.x_handle}
              </Text>
            </Link> 
          </View>        
        </View>
      </View>

      {/* @ts-ignore */}
      <View style={styles.section} id="Profile" bookmark="Profile">
        <Text style={styles.subheader}>Profile</Text>
        <Text style={[styles.text, { fontSize: 10 }]}>{data.profile}</Text>
      </View>
      <View style={styles.columnContainer}>
        {/* @ts-ignore */}
        <View style={styles.leftColumn} id="Work Experience" bookmark={{ title: "Work Experience", fit: false }}>
          <Text style={styles.subheader}>Work Experience</Text>
          {data.work_experience.map((job, index) => (
            <View key={index} style={{ marginBottom: 10 }} break={index > 2}>
              {/* @ts-ignore */}
              <Text style={styles.jobTitle} bookmark={`${job.title} | ${job.company}, ${job.location}`}>
                {job.title} | {job.company}, {job.location}
              </Text>
              <Text style={styles.jobDate}>{job.start_date} - {job.end_date}</Text>
              {job.responsibilities.map((resp, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{resp}</Text>
                </View>
              ))}
              <Text style={styles.tools}>Tools: {job.tools.join(', ')}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rightColumn}>
          {/* @ts-ignore */}
          <View style={styles.section} id="Skills" bookmark="Skills">
            <Text style={styles.subheader}>Skills</Text>
            <Text style={styles.rightSectionText}>
              <Text style={styles.rightSectionBold}>Product: </Text>
              <Text style={{ fontStyle: 'italic' }}>{data.skills.product.join(', ')}</Text>
            </Text>
            <Text style={styles.rightSectionText}>
              <Text style={styles.rightSectionBold}>Development: </Text>
              <Text style={{ fontStyle: 'italic' }}>{data.skills.practices.join(', ')}</Text>
            </Text>
          </View>
          {/* @ts-ignore */}
          <View style={styles.section} id="Projects" bookmark={{ title: "Projects", fit: false }}>
            <Text style={styles.subheader}>Projects</Text>
            {data.projects.filter(project => ['selfie-signin', 'adaptate'].includes(project.key || project.name)).map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <Link src={project.url} style={[styles.link, { fontSize: 9, fontWeight: 'bold', color: '#0e0e0e' }]}>
                  {project.name}
                </Link>
                <Text style={{ fontSize: 8, fontStyle: 'italic', color: '#1c1c1c', marginTop: 1 }}>{project.description}</Text>
              </View>
            ))}
          </View>
          {/* @ts-ignore */}
          <View style={styles.section} id="Accomplishments" bookmark={{ title: "Accomplishments", fit: false }}>
            <Text style={styles.subheader}>Accomplishments</Text>
            {data.courses.map((course, index) => (
              <View key={index} style={styles.projectItem}>
                <Link src={course.url} style={[styles.link, { fontSize: 9, fontFamily: 'Helvetica-Bold' }]}>
                  {course.name}
                </Link>
                <Text style={{ fontSize: 7, fontStyle: 'italic', color: '#666', marginTop: 1 }}>
                  {course.domain}
                </Text>
              </View>
            ))}
          </View>
          {/* @ts-ignore */}
          <View style={styles.section} id="Technologies" bookmark="Technologies">
            <Text style={styles.subheader}>Technologies</Text>
            {Object.entries(data.technologies).map(([cat, items], i) => (
              <Text key={i} style={{ marginBottom: 3 }}>
                <Text style={styles.technologyCategory}>{cat.charAt(0).toUpperCase() + cat.slice(1)}:{' '}</Text>
                <Text style={styles.technologyList}>{items.join(', ')}</Text>
              </Text>
            ))}
          </View>
          {/* @ts-ignore */}
          <View style={styles.section} id="Publications" bookmark="Publications" break>
            <Text style={styles.subheader}>Publications</Text>
            {data.publications.map((pub, i) => (
              <View key={i} style={styles.publicationItem}>
                <Link src={pub.doi_url || pub.url} style={[styles.link, { fontSize: 9, fontFamily: 'Helvetica-Bold' }]}>
                  {pub.title}
                </Link>
                <Text style={{ fontSize: 8, color: '#666', marginTop: 1 }}>
                  {pub.journal ? `${pub.journal.name}, ${pub.first_published}` : `${pub.conference}, ${pub.date}`}
                </Text>
              </View>
            ))}
          </View>
          {/* @ts-ignore */}
          <View style={styles.section} id="Education" bookmark="Education">
            <Text style={styles.subheader}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.educationItem}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{edu.degree}</Text>
                <Text style={styles.rightSectionText}>{edu.institution}</Text>
                <Text>{edu.years}</Text>
              </View>
            ))}
          </View>
          {/* @ts-ignore */}
          <View style={styles.section} id="Languages" bookmark="Languages">
            <Text style={styles.subheader}>Languages</Text>
            {Object.entries(data.languages).map(([lang, level], i) => (
              <Text key={i} style={styles.rightSectionText}>
                {lang}: {level}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <View style={{ paddingTop: 42, margin: 'auto auto 0 auto', fontSize: 8 }} fixed>
        <Text>
          {new Date(Date.now()).toLocaleDateString('sv')} © {data.name}
        </Text>
      </View>
      {/* <Text style={{ textAlign: 'center' }} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed /> */}
    </Page>
  </Document>
);

export default CVDocument;
