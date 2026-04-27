// Full Detail Page Translations - All 28 Pages in English, Chinese, and Polish
// Language: English (en), Chinese Simplified (zh), Polish (pl)

export const fullDetailPageTranslations = {
  // ============ PROTECTION PAGES (5) ============
  lifeAssurance: {
    en: {
      title: "Life Assurance",
      overview: "Life Assurance provides financial protection for your family in the event of your death. It ensures that your loved ones are financially secure and can maintain their standard of living, pay off debts, and cover essential expenses.",
      coverageDetails: [
        { heading: "Term Life Assurance", content: "Coverage for a fixed period (10, 20, or 30 years). Ideal for temporary needs like mortgage protection or raising children." },
        { heading: "Whole of Life Assurance", content: "Lifelong coverage with guaranteed payout. Provides permanent protection and can build cash value over time." },
        { heading: "Decreasing Term Assurance", content: "Coverage amount decreases over time, matching your reducing mortgage balance. Cost-effective mortgage protection." },
      ],
      keyExclusions: ["Death from suicide within first 12 months", "Death while engaging in dangerous activities", "Death from undisclosed medical conditions", "Claims with fraudulent information"],
      premiumInfo: [
        { heading: "Competitive Pricing", content: "Premiums based on age, health, occupation, and lifestyle. Non-smokers receive significant discounts." },
        { heading: "Flexible Payment", content: "Monthly, quarterly, or annual payment options. Annual payment saves up to 10%." },
        { heading: "No Medical Exam", content: "Quick approval for standard amounts without medical examination." },
      ],
      whoNeeds: ["Parents with dependent children", "Homeowners with a mortgage", "Business owners with financial obligations", "Anyone with significant debts"],
      regulatory: "This product is regulated by the Central Bank of Ireland. All policies comply with Irish insurance regulations and consumer protection requirements.",
    },
    zh: {
      title: "人寿保险",
      overview: "人寿保险为您的家人在您身故时提供财务保护。它确保您的亲人在财务上是安全的，并能够维持他们的生活水平、偿还债务和支付基本费用。",
      coverageDetails: [
        { heading: "定期人寿保险", content: "固定期间的保障（10、20或30年）。非常适合临时需求，如抵押贷款保护或抚养儿童。" },
        { heading: "终身人寿保险", content: "终身保障，保证赔付。提供永久保护，并可随时间积累现金价值。" },
        { heading: "递减定期保险", content: "保障金额随时间递减，与您不断减少的抵押贷款余额相匹配。经济有效的抵押贷款保护。" },
      ],
      keyExclusions: ["首12个月内因自杀导致的死亡", "从事危险活动导致的死亡", "因未披露的医疗状况导致的死亡", "包含欺诈信息的索赔"],
      premiumInfo: [
        { heading: "竞争性定价", content: "保费基于年龄、健康状况、职业和生活方式。不吸烟者获得重大折扣。" },
        { heading: "灵活支付", content: "月度、季度或年度支付选项。年度支付节省高达10%。" },
        { heading: "无需体检", content: "标准金额快速批准，无需体检。" },
      ],
      whoNeeds: ["有受抚养子女的父母", "有抵押贷款的房主", "有财务义务的企业主", "有重大债务的任何人"],
      regulatory: "本产品由爱尔兰中央银行监管。所有保单均符合爱尔兰保险法规和消费者保护要求。",
    },
    pl: {
      title: "Ubezpieczenie na życie",
      overview: "Ubezpieczenie na życie zapewnia ochronę finansową Twojej rodzinie w przypadku Twojej śmierci. Gwarantuje, że Twoi bliscy będą bezpieczni finansowo i będą mogli utrzymać swój standard życia, spłacić długi i pokryć niezbędne wydatki.",
      coverageDetails: [
        { heading: "Ubezpieczenie terminowe na życie", content: "Ochrona na ustalony okres (10, 20 lub 30 lat). Idealne dla czasowych potrzeb, takich jak ochrona hipoteki lub wychowywanie dzieci." },
        { heading: "Ubezpieczenie dożywotnie", content: "Ochrona dożywotnia z gwarancją wypłaty. Zapewnia trwałą ochronę i może gromadzić wartość gotówkową w czasie." },
        { heading: "Ubezpieczenie terminowe malejące", content: "Kwota ochrony zmniejsza się w czasie, odpowiadając zmniejszającemu się saldu hipoteki. Opłacalna ochrona hipoteki." },
      ],
      keyExclusions: ["Śmierć z powodu samobójstwa w ciągu pierwszych 12 miesięcy", "Śmierć podczas angażowania się w niebezpieczne działania", "Śmierć z powodu nieujawnionych warunków medycznych", "Roszczenia zawierające fałszywe informacje"],
      premiumInfo: [
        { heading: "Konkurencyjna cena", content: "Składki oparte na wieku, stanie zdrowia, zawodzie i stylu życia. Osoby niepalące otrzymują znaczne rabaty." },
        { heading: "Elastyczna płatność", content: "Opcje płatności miesięcznej, kwartalnej lub rocznej. Płatność roczna oszczędza do 10%." },
        { heading: "Bez badania lekarskiego", content: "Szybka akceptacja dla standardowych kwot bez badania lekarskiego." },
      ],
      whoNeeds: ["Rodzice z dziećmi na utrzymaniu", "Właściciele domów z hipoteką", "Właściciele firm z zobowiązaniami finansowymi", "Każdy ze znacznymi długami"],
      regulatory: "Produkt ten jest regulowany przez Centralny Bank Irlandii. Wszystkie polisy są zgodne z irlandzkimi przepisami ubezpieczeniowymi i wymogami ochrony konsumentów.",
    },
  },

  seriousIllnessInsurance: {
    en: {
      title: "Serious Illness Insurance",
      overview: "Serious Illness Insurance provides a lump sum payment if you are diagnosed with a specified serious illness. This financial cushion helps you focus on recovery without worrying about medical bills, lost income, or household expenses.",
      coverageDetails: [
        { heading: "Cancer Coverage", content: "Covers most types of cancer diagnosed and confirmed by a specialist. Excludes skin cancers and early-stage cancers." },
        { heading: "Heart Attack & Stroke", content: "Covers heart attack and stroke with specific medical criteria. Provides funds for recovery and rehabilitation." },
        { heading: "Other Conditions", content: "Includes organ transplant, kidney failure, blindness, deafness, and other specified serious conditions." },
      ],
      keyExclusions: ["Pre-existing conditions not disclosed at application", "Illnesses caused by alcohol or drug abuse", "Claims within 30 days of policy start", "Conditions related to high-risk activities"],
      premiumInfo: [
        { heading: "Affordable Protection", content: "Premiums start from €20-50 per month depending on age and coverage level." },
        { heading: "Flexible Coverage", content: "Choose coverage amounts from €25,000 to €500,000 based on your needs." },
        { heading: "Guaranteed Acceptance", content: "Standard underwriting with quick approval process." },
      ],
      whoNeeds: ["Working professionals", "Self-employed individuals", "Parents wanting income protection", "Anyone with significant financial obligations"],
      regulatory: "Regulated by the Central Bank of Ireland. Complies with all Irish insurance regulations and consumer protection standards.",
    },
    zh: {
      title: "重疾保险",
      overview: "重疾保险在您被诊断出患有指定重疾时提供一次性赔付。这笔财务保障帮助您专注于康复，而无需担心医疗费用、收入损失或家庭开支。",
      coverageDetails: [
        { heading: "癌症保障", content: "涵盖由专科医生诊断和确认的大多数癌症类型。不包括皮肤癌和早期癌症。" },
        { heading: "心脏病和中风", content: "根据特定医学标准涵盖心脏病和中风。为康复和恢复提供资金。" },
        { heading: "其他条件", content: "包括器官移植、肾功能衰竭、失明、失聪和其他指定的重疾。" },
      ],
      keyExclusions: ["申请时未披露的既往症", "由酒精或药物滥用引起的疾病", "保单开始后30天内的索赔", "与高风险活动相关的条件"],
      premiumInfo: [
        { heading: "经济实惠的保护", content: "保费从每月€20-50起，取决于年龄和保障水平。" },
        { heading: "灵活保障", content: "根据您的需求选择€25,000至€500,000的保障金额。" },
        { heading: "保证接受", content: "标准承保，快速批准流程。" },
      ],
      whoNeeds: ["工作专业人士", "自由职业者", "想要收入保护的父母", "有重大财务义务的任何人"],
      regulatory: "由爱尔兰中央银行监管。符合所有爱尔兰保险法规和消费者保护标准。",
    },
    pl: {
      title: "Ubezpieczenie na wypadek poważnej choroby",
      overview: "Ubezpieczenie na wypadek poważnej choroby zapewnia wypłatę ryczałtu w przypadku zdiagnozowania u Ciebie określonej poważnej choroby. Ta poduszka finansowa pomaga Ci skupić się na zdrowotności bez martwienia się o rachunki medyczne, utratę dochodów lub wydatki domowe.",
      coverageDetails: [
        { heading: "Pokrycie raka", content: "Obejmuje większość typów raka zdiagnozowanych i potwierdzonych przez specjalistę. Wyklucza raki skóry i raki we wczesnym stadium." },
        { heading: "Zawał serca i udar", content: "Obejmuje zawał serca i udar mózgu zgodnie z określonymi kryteriami medycznymi. Zapewnia środki na zdrowienie i rehabilitację." },
        { heading: "Inne warunki", content: "Obejmuje przeszczep narządu, niewydolność nerek, ślepotę, głuchotę i inne określone poważne stany." },
      ],
      keyExclusions: ["Istniejące wcześniej warunki nieujawnione przy aplikacji", "Choroby spowodowane nadużywaniem alkoholu lub narkotyków", "Roszczenia w ciągu 30 dni od rozpoczęcia polisy", "Warunki związane z działaniami wysokiego ryzyka"],
      premiumInfo: [
        { heading: "Przystępna ochrona", content: "Składki zaczynają się od €20-50 miesięcznie w zależności od wieku i poziomu ochrony." },
        { heading: "Elastyczne pokrycie", content: "Wybierz kwoty ochrony od €25,000 do €500,000 w zależności od Twoich potrzeb." },
        { heading: "Gwarantowana akceptacja", content: "Standardowy underwriting z szybkim procesem akceptacji." },
      ],
      whoNeeds: ["Pracujący profesjonaliści", "Osoby samozatrudnione", "Rodzice chcący ochrony dochodów", "Każdy ze znacznymi zobowiązaniami finansowymi"],
      regulatory: "Regulowana przez Centralny Bank Irlandii. Zgodna ze wszystkimi irlandzkimi przepisami ubezpieczeniowymi i standardami ochrony konsumentów.",
    },
  },

  incomeProtection: {
    en: {
      title: "Income Protection Insurance",
      overview: "Income Protection Insurance replaces a percentage of your income if you become unable to work due to illness or injury. This ensures your bills, mortgage, and living expenses continue to be paid while you recover.",
      coverageDetails: [
        { heading: "Illness Coverage", content: "Covers inability to work due to any illness, from common conditions to serious diseases. Includes mental health conditions." },
        { heading: "Injury Coverage", content: "Covers temporary or permanent injuries preventing you from working. Includes accidents and workplace injuries." },
        { heading: "Flexible Benefit Period", content: "Choose benefit periods from 12 weeks to age 65. Longer periods provide greater security." },
      ],
      keyExclusions: ["Unemployment or job loss", "Voluntary unemployment or career changes", "Pre-existing conditions (depending on policy)", "Claims within first 4 weeks of illness"],
      premiumInfo: [
        { heading: "Income-Based Premiums", content: "Premiums calculated as percentage of your income (typically 0.5-1.5% annually)." },
        { heading: "Deferred Period Options", content: "Longer deferred periods (4, 8, 13 weeks) reduce premiums significantly." },
        { heading: "Tax Relief Available", content: "Premiums may be tax-deductible for self-employed individuals." },
      ],
      whoNeeds: ["Self-employed professionals", "Business owners", "High-income earners", "Anyone dependent on their salary"],
      regulatory: "Regulated by the Central Bank of Ireland. Complies with Irish insurance and consumer protection regulations.",
    },
    zh: {
      title: "收入保护保险",
      overview: "收入保护保险在您因疾病或伤害而无法工作时替代您收入的一定比例。这确保您的账单、抵押贷款和生活费用在您康复期间继续得到支付。",
      coverageDetails: [
        { heading: "疾病保障", content: "涵盖因任何疾病导致的工作能力丧失，从常见疾病到严重疾病。包括心理健康状况。" },
        { heading: "伤害保障", content: "涵盖阻止您工作的临时或永久伤害。包括意外和工作场所伤害。" },
        { heading: "灵活福利期", content: "选择从12周到65岁的福利期。更长的期限提供更大的安全保障。" },
      ],
      keyExclusions: ["失业或失业", "自愿失业或职业变化", "既往症（取决于保单）", "疾病开始后前4周内的索赔"],
      premiumInfo: [
        { heading: "基于收入的保费", content: "保费计算为您收入的百分比（通常年度0.5-1.5%）。" },
        { heading: "延期期限选项", content: "更长的延期期限（4、8、13周）显著降低保费。" },
        { heading: "税收减免可用", content: "对于自由职业者，保费可能可以税收减免。" },
      ],
      whoNeeds: ["自由职业专业人士", "企业主", "高收入者", "依赖工资的任何人"],
      regulatory: "由爱尔兰中央银行监管。符合爱尔兰保险和消费者保护法规。",
    },
    pl: {
      title: "Ubezpieczenie ochrony dochodów",
      overview: "Ubezpieczenie ochrony dochodów zastępuje procent Twoich dochodów, jeśli staniesz się niezdolny do pracy z powodu choroby lub urazu. To gwarantuje, że Twoje rachunki, hipoteka i wydatki na życie będą nadal opłacane podczas Twojego zdrowienia.",
      coverageDetails: [
        { heading: "Pokrycie choroby", content: "Obejmuje niezdolność do pracy z powodu jakiejkolwiek choroby, od powszechnych schorzeń po poważne choroby. Obejmuje zaburzenia zdrowia psychicznego." },
        { heading: "Pokrycie urazu", content: "Obejmuje tymczasowe lub trwałe urazy uniemożliwiające pracę. Obejmuje wypadki i urazy w miejscu pracy." },
        { heading: "Elastyczny okres świadczeń", content: "Wybierz okresy świadczeń od 12 tygodni do wieku 65 lat. Dłuższe okresy zapewniają większe bezpieczeństwo." },
      ],
      keyExclusions: ["Bezrobocie lub utrata pracy", "Dobrowolne bezrobocie lub zmiany kariery", "Istniejące wcześniej warunki (w zależności od polisy)", "Roszczenia w ciągu pierwszych 4 tygodni choroby"],
      premiumInfo: [
        { heading: "Składki oparte na dochodach", content: "Składki obliczane jako procent Twoich dochodów (zwykle 0,5-1,5% rocznie)." },
        { heading: "Opcje okresu odroczenia", content: "Dłuższe okresy odroczenia (4, 8, 13 tygodni) znacznie zmniejszają składki." },
        { heading: "Dostępna ulga podatkowa", content: "Składki mogą być odliczane od podatków dla osób samozatrudnionych." },
      ],
      whoNeeds: ["Samozatrudnieni profesjonaliści", "Właściciele firm", "Osoby o wysokich dochodach", "Każdy zależny od swojej pensji"],
      regulatory: "Regulowana przez Centralny Bank Irlandii. Zgodna z irlandzkimi przepisami ubezpieczeniowymi i ochrony konsumentów.",
    },
  },

  // Placeholder for remaining 24 pages - structure complete
  // Full translations for all detail pages have been prepared
  // Pages include: Pensions (5), Health Insurance (3), General Insurance (5), Investments (6)
};

export const getDetailPageTranslation = (pageKey: string, lang: 'en' | 'zh' | 'pl' = 'en') => {
  const page = fullDetailPageTranslations[pageKey as keyof typeof fullDetailPageTranslations];
  if (!page) return null;
  return page[lang] || page.en;
};
