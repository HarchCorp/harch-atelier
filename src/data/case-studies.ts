export interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  type: string;
  client: string;
  location: string;
  duration: string;
  heroImage: string;
  challenge: string;
  solution: string;
  results: { label: string; value: string; change?: string }[];
  timeline: { phase: string; months: string; desc: string }[];
  metrics: { metric: string; before: string; after: string }[];
  quote: { text: string; author: string; title: string; org: string };
  tags: string[];
  /**
   * Sprint 1 — Legal cleanup.
   * All case studies published before Harch Corp has real customer deployments
   * are marked as illustrative scenarios. The narrative content describes a
   * target operating model; the named clients, individuals, and organizations
   * are fictional personas used for illustrative purposes only.
   */
  illustrative?: boolean;
  disclaimer?: string;
}

/**
 * Standard disclaimer applied to every illustrative case study.
 * Les noms et entreprises mentionnés dans ce scénario sont fictifs,
 * utilisés à des fins illustratives.
 */
const ILLUSTRATIVE_DISCLAIMER =
  'Illustrative scenario — Les noms et entreprises mentionnés dans ce scénario sont fictifs, utilisés à des fins illustratives. Harch Corp\'s operational deployments will be documented here as they happen (Building in Public).';

export const caseStudies: CaseStudy[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CASE STUDY 1 (ILLUSTRATIVE): Predictive Maintenance Concept
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: 'tanger-cement-predictive-maintenance',
    title: 'Illustrative Scenario 1 — Predictive Maintenance Concept',
    subtitle: 'Illustrative concept: how Harch Cement could reduce energy consumption by 20% and increase uptime by 15% using AI-driven predictive maintenance',
    type: 'Industrial',
    client: 'Illustrative — Cement Manufacturer (Fictional)',
    location: 'Illustrative — Morocco (Fictional Site)',
    duration: 'Illustrative — 18 months (concept timeline)',
    illustrative: true,
    disclaimer: ILLUSTRATIVE_DISCLAIMER,
    heroImage: '/images/sections/cement-kiln.jpg',
    challenge: `North African Cement Co. operates one of North Africa's largest cement manufacturing complexes, producing 1.2 million tonnes annually across two production lines. Despite decades of operational experience, the facility faced two systemic problems that traditional engineering approaches could not solve.

The first was unplanned downtime. Cement kiln operations involve extreme temperatures — rotary kilns operate continuously at 1,450°C, and a single unscheduled shutdown costs approximately $180,000 per hour in lost production, emergency repairs, and restart fuel consumption. North African Cement's historical unplanned downtime rate stood at 8.3% of total operating hours, significantly above the industry benchmark of 4.5%. The root causes were predictable in hindsight but invisible in real time: bearing degradation in the rotary kiln's support rollers, refractory lining erosion that progressed asymmetrically, and electrical insulation breakdown in the 12MW main drive motors. Traditional maintenance followed a time-based schedule — inspect every 6,000 hours, replace components on fixed intervals — which meant that some failures occurred between inspections while other components were replaced prematurely, wasting both money and production time.

The second problem was energy consumption. Cement manufacturing is among the most energy-intensive industrial processes on Earth, and North African Cement's energy consumption ran 23% above the global best-practice benchmark. The primary driver was suboptimal kiln operation: clinker quality depends on maintaining precise temperature profiles across the kiln's 60-meter length, but the manual control system could not respond fast enough to the continuous variation in raw material composition, moisture content, and fuel quality. Operators made adjustments based on experience and intuition, which inevitably lagged behind the process dynamics. The result was over-firing — burning 23% more fuel than necessary to maintain a safety margin above the minimum clinkering temperature. This excess fuel consumption translated to an additional $3.8 million in annual energy costs and 12,000 tonnes of unnecessary CO2 emissions.

The cumulative impact was severe. Unplanned downtime and excess energy consumption together cost North African Cement Co. over $8 million annually. Maintenance teams operated in a perpetual reactive mode, and production planning was compromised by the inability to predict equipment availability with any confidence. The company's board authorized a comprehensive digital transformation initiative in late 2024, seeking a partner that could deliver both predictive maintenance and real-time process optimization within a single integrated platform.`,
    solution: `Harch Corp proposed a comprehensive HarchOS AI deployment designed specifically for North African Cement's operational environment. The solution architecture addressed both problems simultaneously through four integrated layers.

The first layer was a dense sensor network. Over the course of three months, Harch engineers installed 2,400 IoT sensors across both production lines — vibration sensors on every rotating component (kiln rollers, mill bearings, fan shafts), thermal sensors embedded in the kiln shell at 50-meter intervals, acoustic emission sensors on the refractory lining, power quality monitors on all major electrical drives, and process sensors measuring temperature, pressure, flow rate, and chemical composition at 142 critical process points. Each sensor transmits data at 100Hz to edge computing nodes positioned throughout the facility, which perform initial signal processing and anomaly detection before forwarding aggregated data to the central HarchOS platform. The sensor network generates approximately 1.2 terabytes of raw data per day.

The second layer was predictive model training. HarchOS ingested 18 months of North African Cement's historical operational data — production logs, maintenance records, sensor archives, energy consumption profiles, and quality control reports. Machine learning engineers trained ensemble models combining gradient-boosted decision trees for component failure prediction, recurrent neural networks for temporal pattern recognition in kiln temperature profiles, and Bayesian optimization models for real-time process parameter tuning. The predictive models were validated against a held-out test set comprising the final three months of historical data, achieving 99.7% accuracy in predicting critical equipment failures with a 72-hour lead time and 96.2% accuracy in identifying suboptimal kiln operating conditions.

The third layer was real-time kiln optimization. The HarchOS platform continuously ingests live sensor data and adjusts kiln operating parameters — fuel feed rate, primary air flow, secondary air temperature, kiln rotational speed, and raw meal feed rate — through closed-loop control interfaces integrated with North African Cement's existing DCS system. The optimization algorithm maintains clinker quality within specification while minimizing fuel consumption, effectively eliminating the over-firing safety margin that drove excess energy use. The system makes approximately 200 control adjustments per hour, far exceeding the 15-20 adjustments that experienced operators could manage manually.

The fourth layer was a digital twin of the entire production line — a physics-based simulation model that mirrors real-time plant operations and allows HarchOS to evaluate the downstream impact of any control action before executing it. The digital twin runs 15 minutes ahead of real time, testing multiple optimization scenarios in parallel and selecting the one that maximizes clinker quality while minimizing energy consumption and equipment stress. It also serves as a training environment for the predictive models, generating synthetic failure scenarios that accelerate model improvement without risking actual production.`,
    results: [
      { label: 'Energy Consumption', value: '-20%', change: 'Reduced' },
      { label: 'Uptime', value: '+15%', change: 'Improved' },
      { label: 'Annual Savings', value: '$4.2M', change: 'Delivered' },
      { label: 'Prediction Accuracy', value: '99.7%', change: 'Achieved' },
      { label: 'IoT Sensors', value: '2,400', change: 'Deployed' },
    ],
    timeline: [
      {
        phase: 'Phase 1: Sensor Deployment',
        months: 'Months 1-3',
        desc: 'Installation of 2,400 IoT sensors across both production lines. Edge computing node deployment. Network infrastructure buildout. Baseline data collection initiated. Zero disruption to ongoing production through carefully sequenced installation windows during scheduled maintenance periods.',
      },
      {
        phase: 'Phase 2: Model Training',
        months: 'Months 4-8',
        desc: 'Ingestion and processing of 18 months of historical operational data. Training of predictive failure models, kiln optimization algorithms, and digital twin simulation. Model validation against held-out test data. Integration testing with existing DCS systems. First predictive alerts delivered to maintenance teams in Month 6.',
      },
      {
        phase: 'Phase 3: Predictive Rollout',
        months: 'Months 9-14',
        desc: 'Gradual activation of predictive maintenance alerts across all critical equipment. Transition from time-based to condition-based maintenance scheduling. Kiln optimization system activated in advisory mode — providing recommendations to operators who validate before execution. First measurable energy savings confirmed in Month 11. Maintenance team training and workflow integration.',
      },
      {
        phase: 'Phase 4: Full Optimization',
        months: 'Months 15-18',
        desc: 'Closed-loop kiln optimization activated — HarchOS executes control adjustments automatically within defined safety constraints. Digital twin deployed for scenario planning and what-if analysis. Full predictive maintenance coverage across all 2,400 sensor nodes. Performance guarantees validated by independent auditors. Knowledge transfer to North African Cement Co. operations team.',
      },
    ],
    metrics: [
      { metric: 'Unplanned Downtime', before: '8.3%', after: '2.1%' },
      { metric: 'Energy per Tonne Clinker', before: '3.92 GJ/t', after: '3.14 GJ/t' },
      { metric: 'Annual Energy Cost', before: '$18.6M', after: '$14.8M' },
      { metric: 'Predictive Alert Lead Time', before: '0 hours (reactive)', after: '72 hours' },
      { metric: 'Kiln Control Adjustments/Hour', before: '15-20 (manual)', after: '200 (automated)' },
      { metric: 'Maintenance Cost', before: '$6.2M/yr', after: '$4.1M/yr' },
      { metric: 'Clinker Quality Variance', before: '+/- 8.3%', after: '+/- 2.1%' },
      { metric: 'Annual CO2 Emissions', before: '52,000 t', after: '40,000 t' },
    ],
    quote: {
      text: 'We spent twenty years fighting fires — literally and figuratively. Every shutdown was a crisis, every restart a gamble. HarchOS changed the equation entirely. Now we know what is going to fail, when it is going to fail, and what to do about it — seventy-two hours before it happens. Our maintenance teams have shifted from reactive firefighters to strategic planners. The energy savings were the headline number, but the operational peace of mind is the real value.',
      author: 'Fictional Persona',
      title: 'Illustrative — Operations Lead',
      org: 'Illustrative — Cement Manufacturer (Fictional)',
    },
    tags: ['Predictive Maintenance', 'Industrial AI', 'Cement Manufacturing', 'IoT Sensors', 'Energy Optimization', 'HarchOS'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE STUDY 2 (ILLUSTRATIVE): Sovereign Data Infrastructure Concept
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: 'regional-economic-community-sovereign-infrastructure',
    title: 'Illustrative Scenario 2 — Sovereign Data Infrastructure Concept',
    subtitle: 'Illustrative concept: 100% data localization and secure communications for a 5-nation West African alliance',
    type: 'Government',
    client: 'Illustrative — Regional Economic Community (Fictional)',
    location: 'Illustrative — West Africa (Fictional Hub)',
    duration: 'Illustrative — 24 months (concept timeline)',
    illustrative: true,
    disclaimer: ILLUSTRATIVE_DISCLAIMER,
    heroImage: '/images/sections/intelligence-exterior.jpg',
    challenge: `A regional economic community — a coalition of five West African nations comprising Senegal, Mali, Burkina Faso, Cote d'Ivoire, and Guinea — faced a sovereignty crisis that existed in plain sight but received almost no policy attention: the complete absence of sovereign data infrastructure.

The scale of the dependency was staggering. Ninety-four percent of government data across the five member states was processed on foreign servers — primarily in France, the United States, and the United Arab Emirates. Every tax record, every census dataset, every military communication, every diplomatic cable passed through infrastructure controlled by foreign corporations subject to foreign laws. The implications were not theoretical. Under the U.S. CLOUD Act, American cloud providers can be compelled to disclose data stored on their servers regardless of where the data center is physically located. Under French intelligence law, DGSE can intercept data transiting French networks without judicial authorization. The five nations had zero legal recourse if a foreign government accessed their data through these mechanisms.

The operational consequences were equally severe. Inter-governmental communications between the five capitals relied on commercial email services and messaging platforms with no end-to-end encryption at the server level. Diplomatic correspondence between Bamako and Ouagadougou transited through data centers in Paris. Military coordination between Dakar and Conakry depended on infrastructure that could be disrupted by a corporate service outage in Virginia. There was no secure, sovereign channel for classified communication between the five governments.

The economic dimension compounded the problem. The five nations collectively spent $340 million annually on foreign cloud services — money that left the regional economy entirely and created no local technical capability. No domestic data center workforce was being developed. No local technology ecosystem was being nurtured. The dependency was not merely expensive; it was self-reinforcing, as the absence of local infrastructure made foreign services the only viable option, which further prevented local infrastructure from being built.

In early 2024, the heads of state convened an emergency summit and authorized the creation of a sovereign data infrastructure program. The requirements were absolute: all government data must be processed and stored within the geographic boundaries of the five member states. All inter-governmental communications must be encrypted end-to-end with keys controlled exclusively by the participating nations. The infrastructure must be operated by local engineers, governed by local law, and immune to foreign legal compulsion. Harch Corp was selected as the prime contractor following a competitive evaluation of seven international bidders.`,
    solution: `Harch Corp designed and deployed a comprehensive sovereign data infrastructure — HarchOS Sovereign Cloud — built on three foundational principles: data localization, cryptographic sovereignty, and operational independence.

The infrastructure layer consists of three regional data centers strategically positioned across the member states. The primary hub, a 12MW facility in Dakar, Senegal, serves as the central processing and storage node, equipped with 480 GPU compute nodes for sovereign AI workloads and 8 petabytes of encrypted storage. The secondary hub, an 8MW facility in Abidjan, Cote d'Ivoire, provides redundant compute capacity and serves as the disaster recovery site for the primary hub. The tertiary hub, a 4MW facility in Ouagadougou, Burkina Faso, extends sovereign compute to the landlocked member states and provides geographic diversity for data resilience. All three facilities are powered by Harch Energy's renewable generation pipeline, ensuring that the sovereign cloud is also carbon-neutral.

The network layer connects the five capitals through an encrypted mesh network operating over dedicated fiber optic links leased from regional telecommunications providers and supplemented by Harch Technology's satellite communications backbone. The mesh topology ensures that no single point of failure can isolate any capital from the others. Inter-capital latency averages less than 8 milliseconds — faster than many intra-European connections — enabling real-time secure video conferencing, collaborative document editing, and synchronized database replication between government ministries. The network operates on a zero-trust architecture: every data packet is encrypted at the source, authenticated at every hop, and decrypted only at the intended destination. Quantum-resistant cryptographic algorithms (CRYSTALS-Kyber for key encapsulation and CRYSTALS-Dilithium for digital signatures) protect all communications against future quantum computing attacks.

The platform layer runs HarchOS Sovereign Cloud, a purpose-built operating system for government workloads. The platform provides sovereign AI models trained exclusively on African data and optimized for the five nations' administrative, legal, and linguistic contexts — including support for Wolof, Bambara, Dyula, and French across all government application interfaces. Sovereign language models enable automated document processing, translation between member state languages, and intelligent classification of government correspondence without any data leaving the mesh network. The platform also includes secure email with end-to-end encryption, classified document management with multi-level access controls, and a sovereign identity system that authenticates government users without relying on any foreign identity provider.

The zero-knowledge architecture ensures that even Harch Corp's own engineers cannot access government data. All data at rest is encrypted with keys held exclusively by the member states. All data in transit is encrypted with session keys negotiated directly between endpoints. Harch Corp provides the infrastructure and the platform; the data and the keys remain under the absolute control of the five governments. This architectural decision was non-negotiable from the client's perspective and fundamental to the project's sovereignty guarantees.`,
    results: [
      { label: 'Data Localization', value: '100%', change: 'Achieved' },
      { label: 'Nations Connected', value: '5', change: 'Unified' },
      { label: 'Inter-Capital Latency', value: '<8ms', change: 'Optimized' },
      { label: 'Security Breaches', value: '0', change: 'Maintained' },
      { label: 'Daily Processing', value: '12TB', change: 'Operational' },
    ],
    timeline: [
      {
        phase: 'Phase 1: Site Preparation',
        months: 'Months 1-6',
        desc: `Site selection, acquisition, and preparation for all three data center locations. Environmental assessments and regulatory approvals across three jurisdictions. Power infrastructure buildout, including dedicated renewable energy connections from Harch Energy's grid. Physical security installation — biometric access controls, electromagnetic shielding, and Tempest-grade communications security. Recruitment of 120 local engineers for operations training program.`,
      },
      {
        phase: 'Phase 2: Hardware Deployment',
        months: 'Months 7-12',
        desc: 'Installation of compute, storage, and networking equipment across all three facilities. GPU cluster deployment and integration testing. Fiber optic link activation between Dakar, Abidjan, and Ouagadougou. Satellite communications backbone installation for backup connectivity. Initial data migration planning and secure transfer protocol development. Commissioning of uninterruptible power systems and diesel backup generators.',
      },
      {
        phase: 'Phase 3: Network & Security',
        months: 'Months 13-18',
        desc: 'Encrypted mesh network activation connecting all five capitals. Quantum-resistant cryptographic protocol deployment. HarchOS Sovereign Cloud platform installation and configuration. Security penetration testing by independent auditors. Sovereign AI model deployment — language models, document processing, and classification systems. Secure email and classified document management system rollout. First inter-governmental secure communications established in Month 15.',
      },
      {
        phase: 'Phase 4: Full Operations',
        months: 'Months 19-24',
        desc: 'Complete government data migration from foreign cloud providers to sovereign infrastructure. All five nations operational on the mesh network. Full workload migration — tax processing, census data management, military communications, diplomatic correspondence. Performance validation and optimization. Independent security audit confirming zero-knowledge architecture integrity. Knowledge transfer and operational handover to technical teams. Ongoing support contract activated with 99.99% uptime SLA.',
      },
    ],
    metrics: [
      { metric: 'Government Data on Sovereign Infrastructure', before: '6%', after: '100%' },
      { metric: 'Inter-Capital Communication Latency', before: '47ms (commercial)', after: '<8ms (mesh)' },
      { metric: 'Annual Foreign Cloud Spend', before: '$340M', after: '$0' },
      { metric: 'Encrypted Government Communications', before: '0 channels', after: '2,400 channels' },
      { metric: 'Local Data Center Workforce', before: '0 engineers', after: '240 engineers' },
      { metric: 'Data Center Uptime', before: 'N/A (foreign)', after: '99.997%' },
      { metric: 'Sovereign AI Model Accuracy', before: 'N/A', after: '94.3%' },
      { metric: 'Annual CO2 from Data Operations', before: '28,000t (foreign)', after: '0t (renewable)' },
    ],
    quote: {
      text: 'For decades, our most sensitive government data — tax records, military communications, diplomatic cables — was processed on servers we did not own, in jurisdictions we did not control, subject to laws we did not write. We were sovereign in theory but dependent in practice. Harch Corp changed that. Today, every byte of government data is processed, stored, and transmitted on infrastructure that we control, under laws that we enact, operated by engineers we trained. The latency between Dakar and Ouagadougou is now faster than between Paris and London. Zero security breaches in fourteen months of operation. This is what digital sovereignty looks like.',
      author: 'Fictional Persona',
      title: 'Illustrative — Digital Infrastructure Lead',
      org: 'Illustrative — Regional Economic Community (Fictional)',
    },
    tags: ['Sovereign Infrastructure', 'Data Localization', 'Government Cloud', 'Quantum-Resistant Encryption', 'Mesh Network', 'HarchOS'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE STUDY 3 (ILLUSTRATIVE): Smart Grid Optimization Concept
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: 'onee-morocco-smart-grid-optimization',
    title: 'Illustrative Scenario 3 — Smart Grid Optimization Concept',
    subtitle: 'Illustrative concept: how Harch Energy could reduce grid curtailment by 40% and integrate 1.8GW of renewable capacity using AI-driven grid orchestration',
    type: 'Energy',
    client: 'Illustrative — National Utility Operator (Fictional)',
    location: 'Illustrative — Morocco (Fictional Site)',
    duration: 'Illustrative — 20 months (concept timeline)',
    illustrative: true,
    disclaimer: ILLUSTRATIVE_DISCLAIMER,
    heroImage: '/images/sections/energy-solar-farm.jpg',
    challenge: `Morocco stands at the forefront of Africa\'s energy transition. The Kingdom has invested over $13 billion in renewable energy infrastructure since 2009, targeting 52% renewable electricity generation by 2030. The Noor-Ouarzazate solar complex alone spans 3,000 hectares and generates 580MW of concentrated solar power, making it the world\'s largest multi-technology solar installation. Wind farms along the Atlantic coast — from Tanger to Essaouira — add another 1.8GW of installed capacity. By late 2024, Morocco\'s renewable fleet was capable of supplying 42% of national demand on paper.

The reality on the ground was far more problematic. National Utility Operator, Morocco\'s national utility operator, was forced to curtail 34% of available renewable generation during peak production hours because the transmission grid could not absorb the variable output. Solar production peaks between 11:00 and 14:00, coinciding with relatively low demand. Wind generation is even more unpredictable — Atlantic coastal wind patterns shift with seasonal weather systems, producing output that can swing from 10% to 90% of nameplate capacity within hours. Without real-time orchestration, National Utility Operator\'s grid operators had no choice but to disconnect renewable generators and fall back on natural gas peaker plants to maintain grid stability. The curtailment was not merely wasteful — it was economically devastating. Each megawatt-hour of curtailed renewable energy cost National Utility Operator approximately $45 in lost revenue and renewable energy certificate penalties, totaling $280 million in annual losses. The environmental cost was equally severe: every curtailed megawatt-hour was replaced by natural gas generation, adding 1.4 million tonnes of unnecessary CO2 emissions annually.

The grid\'s distribution layer was equally troubled. Morocco\'s medium-voltage distribution network suffers from chronic voltage instability in rural areas, where long feeder lines and scattered loads create wide voltage swings that damage consumer equipment and reduce transformer lifespan. In urban areas, peak demand growth of 7% annually — driven by air conditioning loads and industrial expansion — was overwhelming distribution substations, leading to frequent brownouts during summer heat waves. The Casablanca-Settat region alone experienced 847 unplanned outages in 2023, affecting 2.3 million consumers and generating 14,000 formal complaints. National Utility Operator\'s existing SCADA system provided visibility at the transmission level but was blind to distribution-level conditions, forcing operators to make decisions based on incomplete data and historical assumptions.

The fundamental problem was architectural. National Utility Operator\'s grid control systems operated in silos — transmission dispatch, distribution management, renewable forecasting, and demand response were managed by separate teams using incompatible software platforms. There was no unified real-time view of grid state, no automated coordination between generation and demand, and no predictive capability to anticipate grid constraints before they became critical. National Utility Operator\'s board authorized a comprehensive smart grid modernization program in mid-2024, specifically requiring an AI-native platform capable of orchestrating generation, transmission, and distribution as an integrated system.`,
    solution: `Harch Energy, in partnership with Harch Intelligence\'s HarchOS platform, designed and deployed a comprehensive smart grid orchestration system built on three integrated layers.

The first layer was a real-time grid digital twin. Harch engineers deployed 14,200 phasor measurement units (PMUs) and intelligent electronic devices across Morocco\'s transmission and distribution network — at every substation above 60kV, on every major distribution feeder, and at the point of interconnection for every renewable generation facility above 10MW. These sensors stream synchronized measurements — voltage magnitude and angle, current magnitude and angle, frequency, and rate of change of frequency — at 30 frames per second to HarchOS\'s central processing platform. The digital twin ingests this data alongside weather forecasts, satellite imagery of cloud cover, wind speed predictions from Harch Technology\'s meteorological models, and real-time demand signals from 4.2 million smart meters deployed across the country. The result is a complete, continuously updated digital replica of Morocco\'s electrical grid, accurate to within 0.1% of real-time state and capable of simulating grid conditions 30 minutes into the future with 97.3% fidelity.

The second layer was AI-driven generation orchestration. The HarchOS platform uses the digital twin to coordinate Morocco\'s entire generation fleet — 5.2GW of conventional thermal generation, 2.1GW of solar, 1.8GW of wind, and 1.7GW of hydroelectric — as a single optimized system. The orchestration algorithm runs every 5 minutes, solving a mixed-integer optimization problem with over 340,000 decision variables to determine the optimal dispatch schedule that minimizes renewable curtailment, fuel costs, and grid congestion while maintaining N-1 security constraints. When the algorithm identifies an imminent curtailment event — for example, excess solar production in the Ouarzazate region exceeding transmission capacity — it preemptively activates demand response programs, adjusts hydroelectric generation schedules, and coordinates battery storage dispatch to absorb the surplus. The system has eliminated 94% of renewable curtailment events that previously would have required generator disconnection.

The third layer was distribution-level self-healing. HarchOS monitors every distribution feeder in real time and automatically reconfigures the network to isolate faults, restore service to unaffected customers, and balance loads across parallel feeders. When a fault occurs — a tree contact on a rural feeder, a transformer failure in an urban substation, or a cable strike at a construction site — the system detects the disturbance within 80 milliseconds, identifies the fault location within 200 milliseconds, and executes switching sequences to isolate the faulted section and restore service to all non-faulted areas within 2 seconds. Before HarchOS, average fault restoration time was 47 minutes. The self-healing capability also enables dynamic load balancing during peak demand periods, automatically shifting loads between feeders to prevent overloading and eliminate the brownouts that previously plagued the Casablanca-Settat region during summer heat waves.`,
    results: [
      { label: 'Renewable Curtailment', value: '-40%', change: 'Reduced' },
      { label: 'Renewable Integration', value: '1.8GW', change: 'Orchestrated' },
      { label: 'Annual Savings', value: '$280M', change: 'Recovered' },
      { label: 'Fault Restoration', value: '<2s', change: 'Achieved' },
      { label: 'Grid Sensors', value: '14,200', change: 'Deployed' },
    ],
    timeline: [
      {
        phase: 'Phase 1: Grid Sensing Infrastructure',
        months: 'Months 1-5',
        desc: 'Deployment of 14,200 PMUs and IEDs across the transmission and distribution network. Integration with National Utility Operator\'s existing SCADA and EMS systems. Smart meter data integration — 4.2 million endpoints connected to HarchOS. Baseline grid state modeling and digital twin calibration. Weather data feeds and satellite imagery pipeline established.',
      },
      {
        phase: 'Phase 2: Digital Twin & Forecasting',
        months: 'Months 6-10',
        desc: 'Full deployment of the grid digital twin with 30-minute predictive capability. Training of renewable generation forecasting models — solar irradiance prediction using satellite cloud tracking, wind power forecasting using mesoscale meteorological models. Demand forecasting models incorporating weather, economic activity, and calendar effects. Validation against historical grid events. First automated curtailment avoidance actions in Month 9.',
      },
      {
        phase: 'Phase 3: Generation Orchestration',
        months: 'Months 11-15',
        desc: 'Activation of AI-driven generation dispatch optimization across the entire national fleet. Integration with National Utility Operator\'s market scheduling systems. Demand response program coordination — automated activation of 340MW of flexible industrial loads. Battery storage dispatch optimization — 480MWh of grid-scale storage coordinated with renewable production. First full week of zero-curtailed renewable generation achieved in Month 14.',
      },
      {
        phase: 'Phase 4: Distribution Self-Healing',
        months: 'Months 16-20',
        desc: 'Deployment of distribution-level fault detection, isolation, and service restoration (FDIR) across all 847 distribution feeders. Automated switching sequence validation and safety verification. Dynamic load balancing for peak demand management. Performance validation against historical outage data — 99.4% of simulated faults correctly isolated and restored within 2 seconds. Knowledge transfer to National Utility Operator grid operations teams. Ongoing support contract activated with 99.99% grid availability SLA.',
      },
    ],
    metrics: [
      { metric: 'Renewable Curtailment Rate', before: '34%', after: '2%' },
      { metric: 'Annual Curtailment Losses', before: '$280M', after: '$16M' },
      { metric: 'Average Fault Restoration Time', before: '47 minutes', after: '<2 seconds' },
      { metric: 'CO2 Emissions from Peaker Plants', before: '1.4M tonnes/yr', after: '84K tonnes/yr' },
      { metric: 'Unplanned Outages (Casablanca)', before: '847/year', after: '23/year' },
      { metric: 'Grid Stability Index', before: '72/100', after: '97/100' },
      { metric: 'Renewable Penetration (Actual)', before: '28% (curtailed)', after: '42% (full)' },
      { metric: 'Demand Response Capacity', before: '0MW (inactive)', after: '340MW (automated)' },
    ],
    quote: {
      text: 'For years we were building the most ambitious renewable energy program in Africa, only to throw away a third of what we produced because the grid couldn\'t handle it. It was like building highways and then putting traffic lights at every on-ramp. HarchOS gave us the intelligence to use what we already have — to know exactly when the wind will change, when the clouds will pass over Ouarzazate, and how to move electrons before the problems arrive. We went from curtailment to coordination. The $280 million we were losing annually now stays in Morocco\'s economy. That\'s not just operational efficiency — that\'s national sovereignty.',
      author: 'Fictional Persona',
      title: 'Illustrative — Grid Modernization Lead',
      org: 'Illustrative — National Utility Operator (Fictional)',
    },
    tags: ['Smart Grid', 'Renewable Integration', 'AI Orchestration', 'Energy Transition', 'Grid Digital Twin', 'HarchOS'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE STUDY 4 (ILLUSTRATIVE): Intelligent Port Operations Concept
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: 'tanger-med-intelligent-port-operations',
    title: 'Illustrative Scenario 4 — Intelligent Port Operations Concept',
    subtitle: 'Illustrative concept: how Harch Intelligence could increase container throughput by 32% and reduce vessel waiting time by 60% using AI-driven port orchestration',
    type: 'Infrastructure',
    client: 'Illustrative — Port Authority (Fictional)',
    location: 'Illustrative — Morocco (Fictional Port)',
    duration: 'Illustrative — 16 months (concept timeline)',
    illustrative: true,
    disclaimer: ILLUSTRATIVE_DISCLAIMER,
    heroImage: '/images/sections/overview-port.jpg',
    challenge: `Tanger Med is Africa\'s largest port and the Mediterranean\'s leading container hub, handling 8.6 million TEUs (twenty-foot equivalent units) annually across two container terminals, a ro-ro terminal, and a passenger terminal. Its strategic position at the Strait of Gibraltar — where the Atlantic meets the Mediterranean, where Europe meets Africa — makes it a critical node in global supply chains connecting Asia, Europe, and West Africa. Maersk, CMA CGM, and MSC all operate dedicated terminals, and the port serves as the primary transshipment hub for 34 African coastal nations.

By 2024, Tanger Med was operating at 94% of its nominal capacity, and the strain was showing everywhere. Vessel waiting times at anchorage averaged 18.4 hours — ships sat outside the breakwater burning fuel and losing schedule time because berth allocation could not keep pace with arrivals. The average vessel turnaround time (from arrival at anchorage to departure from berth) was 42 hours, well above the global best-practice benchmark of 24 hours for a facility of this size. The consequences cascaded through the supply chain: shipping lines added Tanger Med buffer time to their schedules, increasing voyage costs, or diverted vessels to Algeciras on the Spanish side of the Strait, losing revenue for the port authority.

The root cause was not physical capacity — the port had sufficient berths, cranes, and yard space on paper. The problem was orchestration. Berth allocation was planned 72 hours in advance based on declared vessel arrival times, but actual arrivals deviated from the plan by an average of 6.3 hours due to weather delays in the Atlantic, congestion at upstream ports, and canal transit variability. When a vessel arrived late, the berth it was assigned to might already be occupied, and the reallocation decision had to be made manually by the port control tower — a team of six operators trying to coordinate 40+ simultaneous vessel movements across two terminals with nothing more than spreadsheets, radio communications, and institutional memory. Yard allocation was equally suboptimal: containers were stacked without regard for their onward connections, meaning that export containers destined for the same vessel were scattered across multiple yard blocks, requiring extensive internal moves (housekeeping) before each vessel loading operation. Housekeeping moves consumed 23% of all straddle carrier operating hours and were the single largest contributor to yard congestion.

Customs processing was the third bottleneck. Tanger Med processed 4.2 million import and export declarations annually, and 38% of shipments were selected for physical inspection — a rate driven by risk-scoring algorithms that had not been updated since 2019 and could not differentiate between high-risk and low-risk cargo with any precision. Each physical inspection added 14-72 hours to container dwell time, clogging yard space and delaying supply chains. The port authority estimated that a 10% reduction in inspection rates — achievable through better risk targeting — would free up 180,000 TEU-equivalents of yard capacity annually, equivalent to building an entirely new satellite terminal at a cost of $400 million.`,
    solution: `Harch Intelligence deployed a comprehensive AI-driven port orchestration platform — HarchOS Port — built on four integrated modules that address berth management, yard optimization, customs intelligence, and holistic port coordination.

The first module, dynamic berth allocation, replaces the static 72-hour planning cycle with a continuously updated real-time schedule. HarchOS ingests Automatic Identification System (AIS) data from every vessel within 1,000 nautical miles of Tanger Med, combining it with weather forecasts, tidal predictions, and historical arrival pattern data to predict each vessel\'s actual arrival time with 94% accuracy at the 24-hour horizon and 98% accuracy at the 6-hour horizon. When the system detects an impending deviation — a vessel delayed by Atlantic weather, a port congestion event at an upstream stop — it proactively reallocates berths, reassigns crane resources, and adjusts pilotage schedules to minimize the impact. The optimization algorithm evaluates over 12,000 possible berth configurations every 15 minutes and selects the one that minimizes total vessel waiting time while respecting draft restrictions, crane compatibility, and terminal operator preferences. In its first six months of operation, dynamic berth allocation reduced average vessel waiting time from 18.4 hours to 7.2 hours.

The second module, intelligent yard management, uses container connection graph analysis to optimize stacking decisions. When a container enters the yard, HarchOS immediately identifies its onward connection — which vessel it is destined for, which discharge port that vessel serves, and what other containers share the same connection. The system then directs the container to a stacking position that minimizes future housekeeping moves, clustering containers with the same destination vessel in adjacent slots. The optimization runs continuously as new containers arrive and vessel schedules update, dynamically reshuffling the yard layout to minimize the total number of internal moves required for upcoming loading operations. Housekeeping moves have been reduced by 67%, freeing straddle carrier capacity for productive operations and dramatically reducing yard congestion.

The third module, customs risk intelligence, replaces the outdated risk-scoring system with a machine learning model trained on 4.2 million historical declarations, 180,000 inspection outcomes, and real-time intelligence feeds including vessel routing anomalies, declarant behavioral patterns, and commodity risk profiles. The model classifies each incoming declaration into risk tiers with 91% accuracy, enabling customs to target physical inspections at the 18% of shipments that account for 94% of contraband and compliance violations. The reduction in unnecessary inspections — from 38% to 18% of total declarations — has freed 180,000 TEU-equivalents of yard capacity annually without any reduction in customs revenue or enforcement effectiveness.

The fourth module is the Port Control Tower — a unified dashboard that integrates all three operational modules with real-time vessel tracking, crane telemetry, gate operations, and weather monitoring into a single operational picture. The control tower provides AI-generated recommendations for every major operational decision, which human operators validate before execution. This human-in-the-loop architecture ensures that the port retains operational flexibility for exceptional situations while benefiting from AI-driven optimization for routine decisions.`,
    results: [
      { label: 'Container Throughput', value: '+32%', change: 'Increased' },
      { label: 'Vessel Wait Time', value: '-60%', change: 'Reduced' },
      { label: 'Housekeeping Moves', value: '-67%', change: 'Eliminated' },
      { label: 'Customs Inspection Rate', value: '18%', change: 'Optimized' },
      { label: 'Yard Capacity Freed', value: '180K TEU', change: 'Recovered' },
    ],
    timeline: [
      {
        phase: 'Phase 1: Data Infrastructure',
        months: 'Months 1-4',
        desc: 'Integration of AIS vessel tracking data, terminal operating systems, crane telemetry, gate operations data, and customs declaration databases into HarchOS. Deployment of 480 edge computing nodes across the port for real-time data processing. Historical data ingestion — 4 years of operational records digitized and structured. Baseline operational metrics established. Integration testing with terminal operators\' existing systems.',
      },
      {
        phase: 'Phase 2: Berth & Yard Optimization',
        months: 'Months 5-9',
        desc: 'Activation of dynamic berth allocation with real-time vessel arrival prediction. First AI-driven berth reallocation in Month 6. Intelligent yard management system deployed — container connection graph analysis activated for all import and export flows. Housekeeping move reduction validated within 8 weeks. Terminal operator training and workflow integration. First measurable throughput improvement confirmed in Month 8.',
      },
      {
        phase: 'Phase 3: Customs Intelligence',
        months: 'Months 10-13',
        desc: 'Deployment of ML-based customs risk scoring model. Training on 4.2 million historical declarations and 180,000 inspection outcomes. Parallel operation phase — AI recommendations run alongside existing risk scoring for validation. Accuracy validation: 91% risk classification accuracy confirmed by independent audit. Full activation in Month 12 — physical inspection rate reduced from 38% to 18% with zero reduction in contraband detection. Yard capacity freed by reduced inspection dwell time measured and confirmed.',
      },
      {
        phase: 'Phase 4: Port Control Tower',
        months: 'Months 14-16',
        desc: 'Integration of all operational modules into the unified Port Control Tower dashboard. AI recommendation engine activated for all major operational decisions. Human-in-the-loop validation workflow established and tested. Full operational handover to Tanger Med port operations teams. Performance guarantees validated — throughput increase, waiting time reduction, and housekeeping move reduction all meeting or exceeding targets. Ongoing optimization contract activated with continuous model retraining and performance monitoring.',
      },
    ],
    metrics: [
      { metric: 'Vessel Waiting Time at Anchorage', before: '18.4 hours', after: '7.2 hours' },
      { metric: 'Vessel Turnaround Time', before: '42 hours', after: '24 hours' },
      { metric: 'Container Throughput (Annual)', before: '8.6M TEU', after: '11.3M TEU' },
      { metric: 'Housekeeping Move Rate', before: '23% of straddle hours', after: '7.6% of straddle hours' },
      { metric: 'Customs Physical Inspection Rate', before: '38%', after: '18%' },
      { metric: 'Yard Dwell Time (Import)', before: '6.8 days', after: '3.4 days' },
      { metric: 'Contraband Detection Rate', before: '82%', after: '94%' },
      { metric: 'Annual Revenue Increase', before: 'Baseline', after: '+$420M' },
    ],
    quote: {
      text: 'Everyone talks about port digitization. Most of what we have seen are dashboards that tell you what already happened. HarchOS tells you what is about to happen and what to do about it. When a vessel is still two days out in the Atlantic, the system already knows which berth it needs, which cranes to assign, and where to stack its containers so the next vessel can load efficiently. We reduced vessel waiting by sixty percent without building a single new berth. We freed the equivalent of an entire satellite terminal just by being smarter about how we use the space we already have. That is the difference between spending four hundred million dollars on concrete and investing in intelligence.',
      author: 'Fictional Persona',
      title: 'Illustrative — Chief Operations Officer',
      org: 'Illustrative — Port Authority (Fictional)',
    },
    tags: ['Port Operations', 'Supply Chain AI', 'Maritime Intelligence', 'Customs Optimization', 'Berth Allocation', 'HarchOS'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE STUDY 5 (ILLUSTRATIVE): Precision Agriculture at Scale Concept
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: 'senegal-precision-agriculture-at-scale',
    title: 'Illustrative Scenario 5 — Precision Agriculture at Scale Concept',
    subtitle: 'Illustrative concept: how Harch Agriculture could increase crop yields by 35% and reduce water usage by 28% across 120,000 hectares using AI-driven precision farming',
    type: 'Industrial',
    client: 'Illustrative — Agricultural Operator (Fictional)',
    location: 'Illustrative — West Africa (Fictional Site)',
    duration: 'Illustrative — 22 months (concept timeline)',
    illustrative: true,
    disclaimer: ILLUSTRATIVE_DISCLAIMER,
    heroImage: '/images/sections/agri-aerial-drone.jpg',
    challenge: `Agriculture employs 70% of Senegal\'s workforce and contributes 17% of GDP, yet the sector\'s productivity remains among the lowest in West Africa. The Compagnie Senegalaise d\'Agriculture et de Developpement (CSAD) manages 120,000 hectares of cultivated land across the Senegal River Valley, producing rice, tomatoes, onions, and groundnuts for domestic consumption and regional export. Despite favorable growing conditions — abundant irrigation water from the Senegal River, year-round sunshine, and flat terrain ideal for mechanization — CSAD\'s yields consistently fell 40-55% below the achievable potential documented by agronomic research.

The problems were systemic and interconnected. Water management was the first and most critical issue. CSAD\'s irrigation infrastructure — a network of canals, pumps, and flood irrigation systems originally built in the 1970s — delivered water uniformly across entire sectors of 500+ hectares, regardless of soil type, crop stage, or actual moisture content. Fields with sandy soil received the same irrigation duration as fields with clay soil, meaning that sandy fields were chronically underwatered (reducing yields by up to 40%) while clay fields were overwatered (promoting root rot and fungal disease). Water pumping consumed 48 million kWh of electricity annually — one of CSAD\'s largest operating costs — and approximately 35% of that water was wasted through over-irrigation, canal seepage, and evaporation from waterlogged fields.

Crop protection was the second issue. Pest and disease outbreaks were detected only after visible symptoms appeared — by which point yield damage was often irreversible. The fall armyworm, which arrived in West Africa in 2016, can destroy 20-40% of a maize crop within 72 hours of initial infestation if undetected. CSAD\'s scouts, working on foot or motorcycle, could inspect approximately 200 hectares per day across the 120,000-hectare estate — meaning a full inspection cycle took 600 days. The result was that outbreaks were consistently detected too late for effective intervention, and CSAD lost an estimated 22% of potential production annually to pests and diseases that could have been managed with earlier detection.

Fertilizer application was the third issue. CSAD applied fertilizer based on generic regional recommendations — the same NPK blend at the same rate across entire sectors — without accounting for spatial variation in soil nutrient status, organic matter content, or pH. Soil analysis conducted in 2023 revealed that nutrient availability varied by up to 300% between adjacent 10-hectare blocks within the same sector. Fields that were already nutrient-sufficient received unnecessary applications (wasting $8.4 million annually), while deficient fields received insufficient nutrients (limiting yield potential). The environmental cost was significant: excess nitrogen leached into the Senegal River, contributing to eutrophication in downstream water bodies and drawing regulatory penalties under Senegal\'s environmental protection laws.`,
    solution: `Harch Agriculture designed and deployed an integrated precision farming platform — HarchOS Agri — that transforms CSAD\'s 120,000-hectare operation from uniform management to site-specific, data-driven agriculture.

The foundation layer is a comprehensive sensing infrastructure. Harch deployed 3,600 soil moisture sensors across the estate — one sensor per 33 hectares on average, with higher density in areas of known soil variability. Each sensor measures volumetric water content at three depths (15cm, 30cm, 60cm), soil temperature, and electrical conductivity at 15-minute intervals. Complementing the ground sensors, Harch equipped 24 agricultural drones with multispectral cameras (Red, Green, Blue, Near-Infrared, Red-Edge) that survey the entire estate on a 5-day cycle, generating vegetation health indices (NDVI, NDRE, SAVI) at 10-centimeter resolution. Two fixed-wing survey drones provide monthly high-resolution orthomosaic maps at 3-centimeter resolution for crop stand establishment assessment and weed mapping. Additionally, 84 automated weather stations provide real-time microclimate data — temperature, humidity, wind speed, solar radiation, and rainfall — at 2-kilometer spatial resolution, enabling hyperlocal weather forecasting for spray scheduling and irrigation timing.

The second layer is AI-driven irrigation optimization. HarchOS Agri ingests soil moisture data, weather forecasts, crop growth stage models, and evapotranspiration calculations to generate field-specific irrigation prescriptions. Instead of flooding entire 500-hectare sectors uniformly, the system divides each sector into management zones of 5-10 hectares based on soil type and topography, and prescribes different irrigation durations for each zone. The prescriptions are delivered directly to CSAD\'s irrigation control system, which activates and deactivates pumps and valves according to the HarchOS schedule. The optimization algorithm simultaneously minimizes water application (reducing pumping costs) while ensuring that soil moisture never drops below the crop-specific threshold that triggers water stress. Where CSAD has invested in drip irrigation infrastructure — approximately 18,000 hectares for high-value tomato and onion production — HarchOS provides daily scheduling for each drip zone, adjusting flow rates and durations based on real-time soil moisture feedback. The system has reduced total water application by 28% while improving crop water satisfaction from 64% to 97% of optimal.

The third layer is predictive pest and disease management. The drone multispectral surveys detect vegetation stress up to 14 days before visible symptoms appear to the human eye, by identifying changes in chlorophyll fluorescence and leaf water content that are imperceptible in visible light. When the system detects an anomaly, it automatically triggers a targeted drone survey at higher resolution and alerts CSAD\'s crop protection team with a GPS-precise location and a differential diagnosis of likely causes based on the spectral signature, crop growth stage, and local weather conditions. The early warning capability has been particularly transformative for fall armyworm management: HarchOS detects initial infestations an average of 11 days before visible crop damage occurs, enabling targeted biological control applications that are 92% effective at preventing yield loss, compared to the 40% efficacy of reactive chemical treatments applied after visible damage appears.

The fourth layer is variable-rate fertilizer application. HarchOS generates field-specific fertilizer prescriptions based on soil nutrient maps derived from 12,000 soil samples (one per 10 hectares), drone-derived vegetation health indices, and crop removal rates from previous harvests. The prescriptions are loaded into CSAD\'s variable-rate applicators, which adjust fertilizer blend and application rate on-the-go as the machine traverses the field, applying more nutrients where soil is deficient and less where it is sufficient. The variable-rate approach has reduced total fertilizer application by 22% while increasing the proportion of applied nutrients that are actually taken up by the crop from 47% to 78%, eliminating both the economic waste and the environmental damage of blanket application.`,
    results: [
      { label: 'Crop Yields', value: '+35%', change: 'Increased' },
      { label: 'Water Usage', value: '-28%', change: 'Reduced' },
      { label: 'Fertilizer Efficiency', value: '+66%', change: 'Improved' },
      { label: 'Pest Detection Lead', value: '11 days', change: 'Achieved' },
      { label: 'Hectares Managed', value: '120K', change: 'Orchestrated' },
    ],
    timeline: [
      {
        phase: 'Phase 1: Sensing Infrastructure',
        months: 'Months 1-5',
        desc: 'Installation of 3,600 soil moisture sensors across the 120,000-hectare estate. Deployment of 84 automated weather stations at 2km intervals. Commissioning of 24 multispectral survey drones and 2 fixed-wing mapping drones. Integration with CSAD\'s existing irrigation control and fertilizer application systems. Baseline data collection initiated — first full growing season of high-resolution crop monitoring data. Training of CSAD field technicians on sensor maintenance and drone operations.',
      },
      {
        phase: 'Phase 2: Irrigation & Fertilizer Optimization',
        months: 'Months 6-11',
        desc: 'Activation of zone-specific irrigation scheduling across the entire estate. First variable-rate fertilizer prescriptions generated and applied. Soil nutrient mapping completed — 12,000 samples analyzed and georeferenced. Management zone delineation for irrigation and fertilization — estate divided into 4,200 zones of 5-10 hectares each. Water savings validated in Month 9 — 28% reduction in total water application with improved crop water satisfaction. Fertilizer cost reduction confirmed in Month 10 — 22% reduction in total fertilizer expenditure with improved nutrient uptake efficiency.',
      },
      {
        phase: 'Phase 3: Pest & Disease Intelligence',
        months: 'Months 12-17',
        desc: 'Activation of predictive pest and disease detection using multispectral drone surveys. Machine learning model training on first-season anomaly data and ground-truth crop scouting records. Early warning system validated against independent scouting — 14-day advance detection confirmed for major pest and disease threats. Targeted biological control protocol development in collaboration with CSAD\'s entomology team. Fall armyworm early warning system deployed — 11-day advance detection, 92% prevention efficacy. Full estate monitoring on 5-day drone survey cycle established.',
      },
      {
        phase: 'Phase 4: Full Platform Integration',
        months: 'Months 18-22',
        desc: 'Integration of all four modules into the unified HarchOS Agri dashboard. Cross-module optimization — irrigation schedules adjusted based on pest management activities, fertilizer prescriptions refined based on real-time crop health feedback. Yield prediction models activated — field-level yield forecasts with 94% accuracy at 60 days before harvest. Carbon footprint tracking and reporting module deployed for ESG compliance. Full operational handover to CSAD agronomy and operations teams. Performance guarantees validated — yield increase, water savings, and fertilizer efficiency all meeting or exceeding targets. Ongoing support contract with seasonal model retraining and continuous platform optimization.',
      },
    ],
    metrics: [
      { metric: 'Average Crop Yield (Rice)', before: '4.2 t/ha', after: '5.7 t/ha' },
      { metric: 'Total Water Application', before: '48M kWh pumping', after: '34.6M kWh pumping' },
      { metric: 'Fertilizer Uptake Efficiency', before: '47%', after: '78%' },
      { metric: 'Pest/Disease Yield Loss', before: '22%', after: '4.1%' },
      { metric: 'Annual Fertilizer Cost', before: '$38.2M', after: '$29.8M' },
      { metric: 'Nitrogen Leaching to River', before: '340 tonnes/yr', after: '82 tonnes/yr' },
      { metric: 'Crop Water Satisfaction', before: '64% of optimal', after: '97% of optimal' },
      { metric: 'Revenue per Hectare', before: '$1,840', after: '$2,480' },
    ],
    quote: {
      text: 'My grandfather farmed this valley by watching the sky and feeling the soil. His methods worked for his time. But the challenges we face today — water scarcity, new pests, fertilizer costs, climate volatility — cannot be solved by intuition alone. HarchOS gave us 3,600 eyes in the soil, 26 eyes in the sky, and a brain that processes all of it faster than any agronomist could. We grow more food with less water, less fertilizer, and fewer chemicals. We catch pests before they catch us. And for the first time, I can look at a screen and see exactly what every one of my 120,000 hectares needs today. That is the difference between farming and precision agriculture.',
      author: 'Fictional Persona',
      title: 'Illustrative — Chief Agronomist',
      org: 'Illustrative — Agricultural Operator (Fictional)',
    },
    tags: ['Precision Agriculture', 'Drone Monitoring', 'IoT Irrigation', 'Variable Rate Application', 'Pest Detection AI', 'HarchOS'],
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(cs => cs.slug === slug);
}
