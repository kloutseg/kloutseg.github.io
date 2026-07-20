const siteUrl = 'https://www.kloutseguros.com.br';

type SchemaNode = Record<string, unknown>;

type PageSchemaInput = {
  path: string;
  title?: string;
  description?: string;
  pageType?: string | string[];
  breadcrumbName?: string;
  image?: string;
  mainEntity?: SchemaNode;
  additionalGraph?: SchemaNode[];
  includeBreadcrumb?: boolean;
};

const sameAs = [
  'https://www.instagram.com/klout_seguros/',
  'https://www.linkedin.com/company/klout-seguros',
  'https://www.facebook.com/p/Klout-Seguros-61560510511311/',
];

const primaryAddress = {
  '@type': 'PostalAddress',
  streetAddress: 'R. da Quitanda, 96',
  addressLocality: 'São Paulo',
  addressRegion: 'SP',
  postalCode: '01012-010',
  addressCountry: 'BR',
};

const jundiaiAddress = {
  '@type': 'PostalAddress',
  streetAddress: 'R. Sen. Fonseca, 715',
  addressLocality: 'Jundiaí',
  addressRegion: 'SP',
  postalCode: '13201-017',
  addressCountry: 'BR',
};

const serviceArea = {
  '@type': 'Country',
  name: 'Brasil',
};

export const kloutOrganizationId = `${siteUrl}/#organization`;
export const kloutWebsiteId = `${siteUrl}/#website`;
export const kloutPrimaryLocationId = `${siteUrl}/#localbusiness-quitanda`;
export const kloutJundiaiLocationId = `${siteUrl}/#localbusiness-jundiai`;

const contactPoint = {
  '@type': 'ContactPoint',
  telephone: '+55-11-92550-6721',
  contactType: 'customer service',
  email: 'contato@kloutseguros.com.br',
  areaServed: 'BR',
  availableLanguage: ['pt-BR'],
};

const identifiers = [
  {
    '@type': 'PropertyValue',
    name: 'CNPJ principal',
    value: '60.772.160/0001-80',
    description: 'CNPJ vinculado a SUSEP e usado como identificador empresarial principal da Klout.',
  },
  {
    '@type': 'PropertyValue',
    name: 'CNPJ subsidiário',
    value: '55.454.842/0001-05',
    description: 'CNPJ subsidiário associado a Klout Assessoria de Seguros.',
  },
];

const organizationNode = {
  '@type': ['Organization', 'LocalBusiness', 'InsuranceAgency'],
  '@id': kloutOrganizationId,
  name: 'Klout Consultoria',
  legalName: 'Klout Corretora de Seguros LTDA',
  alternateName: ['Klout Seguros', 'Klout Assessoria de Seguros'],
  description:
    'Consultoria em planos de saúde com alta personalização, atuando também como corretora consultiva e em consórcios.',
  url: siteUrl,
  logo: {
    '@type': 'ImageObject',
    '@id': `${siteUrl}/#logo`,
    url: `${siteUrl}/images/logo_v3_blue.png`,
    contentUrl: `${siteUrl}/images/logo_v3_blue.png`,
  },
  image: `${siteUrl}/images/logo_v3_blue.png`,
  email: 'contato@kloutseguros.com.br',
  telephone: '+55-11-92550-6721',
  taxID: '60.772.160/0001-80',
  identifier: identifiers,
  address: primaryAddress,
  contactPoint,
  sameAs,
  areaServed: serviceArea,
  knowsAbout: [
    'planos de saúde',
    'consultoria em planos de saúde',
    'corretagem de seguros',
    'seguros saúde',
    'benefícios corporativos',
    'consórcios',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Serviços da Klout',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Consultoria em planos de saúde',
          serviceType: 'Consultoria personalizada em planos de saúde',
          areaServed: serviceArea,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Corretagem consultiva',
          serviceType: 'Corretagem de seguros com abordagem consultiva',
          areaServed: serviceArea,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Consórcios',
          serviceType: 'Orientação comercial em consórcios',
          areaServed: serviceArea,
        },
      },
    ],
  },
};

const websiteNode = {
  '@type': 'WebSite',
  '@id': kloutWebsiteId,
  name: 'Klout Consultoria',
  alternateName: 'Klout',
  url: siteUrl,
  inLanguage: 'pt-BR',
  publisher: {
    '@id': kloutOrganizationId,
  },
};

const normalizePath = (path: string) => {
  if (!path || path === '/') return '/';
  const pathname = path.startsWith('http') ? new URL(path).pathname : path;
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
};

const absoluteUrl = (path: string) => {
  const normalized = normalizePath(path);
  return normalized === '/' ? `${siteUrl}/` : `${siteUrl}${normalized}`;
};

const pageNameFromTitle = (title?: string) => title?.replace(/\s*\|\s*Klout\s*$/i, '').trim();

const buildBreadcrumb = (path: string, currentName?: string) => {
  const normalized = normalizePath(path);
  if (normalized === '/') return null;

  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(normalized)}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Klout',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: currentName || 'Página',
        item: absoluteUrl(normalized),
      },
    ],
  };
};

export const buildKloutPageSchema = ({
  path,
  title,
  description,
  pageType = 'WebPage',
  breadcrumbName,
  image,
  mainEntity,
  additionalGraph = [],
  includeBreadcrumb = false,
}: PageSchemaInput) => {
  const pageUrl = absoluteUrl(path);
  const pageName = pageNameFromTitle(title) || breadcrumbName || 'Klout';
  const breadcrumb = includeBreadcrumb ? buildBreadcrumb(path, breadcrumbName || pageName) : null;

  const webpageNode: SchemaNode = {
    '@type': pageType,
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: pageName,
    description,
    inLanguage: 'pt-BR',
    isPartOf: {
      '@id': kloutWebsiteId,
    },
    about: {
      '@id': kloutOrganizationId,
    },
    publisher: {
      '@id': kloutOrganizationId,
    },
  };

  if (breadcrumb) {
    webpageNode.breadcrumb = {
      '@id': `${pageUrl}#breadcrumb`,
    };
  }

  if (image) {
    webpageNode.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: image.startsWith('http') ? image : `${siteUrl}${image}`,
    };
  }

  if (mainEntity?.['@id']) {
    webpageNode.mainEntity = {
      '@id': mainEntity['@id'],
    };
  } else if (mainEntity) {
    webpageNode.mainEntity = mainEntity;
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode,
      websiteNode,
      webpageNode,
      ...(breadcrumb ? [breadcrumb] : []),
      ...(mainEntity?.['@id'] ? [mainEntity] : []),
      ...additionalGraph,
    ],
  };
};

const serviceNode = (
  path: string,
  name: string,
  serviceType: string,
  description: string,
  audienceType: string,
) => ({
  '@type': 'Service',
  '@id': `${absoluteUrl(path)}#service`,
  name,
  serviceType,
  description,
  provider: {
    '@id': kloutOrganizationId,
  },
  areaServed: serviceArea,
  audience: {
    '@type': audienceType,
  },
});

export const kloutHomeSchema = buildKloutPageSchema({
  path: '/',
  title: 'Klout | Inteligência em planos de saúde',
  description:
    'A Klout compara custo, cobertura e acesso real para orientar decisões mais eficientes em planos de saúde para pessoas e empresas.',
  pageType: 'WebPage',
});

export const kloutAboutSchema = buildKloutPageSchema({
  path: '/a-klout',
  title: 'A Klout',
  description:
    'Conheça a Klout, consultoria especializada em planos de saúde que une análise técnica, curadoria e orientação estratégica.',
  pageType: 'AboutPage',
  image: '/images/about_klout_hero_consultive.webp',
  additionalGraph: [
    {
      '@type': ['LocalBusiness', 'InsuranceAgency'],
      '@id': kloutPrimaryLocationId,
      name: 'Klout Consultoria - Unidade base',
      branchOf: {
        '@id': kloutOrganizationId,
      },
      url: `${siteUrl}/a-klout`,
      email: 'contato@kloutseguros.com.br',
      telephone: '+55-11-92550-6721',
      taxID: '60.772.160/0001-80',
      address: primaryAddress,
      priceRange: '$$',
      areaServed: serviceArea,
    },
    {
      '@type': ['LocalBusiness', 'InsuranceAgency'],
      '@id': kloutJundiaiLocationId,
      name: 'Klout Consultoria - Unidade Jundiaí',
      branchOf: {
        '@id': kloutOrganizationId,
      },
      url: `${siteUrl}/a-klout`,
      email: 'contato@kloutseguros.com.br',
      telephone: '+55-11-92550-6721',
      address: jundiaiAddress,
      priceRange: '$$',
      areaServed: serviceArea,
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization-klout-assessoria`,
      name: 'Klout Assessoria de Seguros',
      legalName: 'Klout Assessoria de Seguros',
      taxID: '55.454.842/0001-05',
      parentOrganization: {
        '@id': kloutOrganizationId,
      },
    },
  ],
});

export const kloutForYouSchema = buildKloutPageSchema({
  path: '/para-voce',
  title: 'Para Você | Klout',
  description:
    'Encontre um plano de saúde alinhado à sua rotina, rede de atendimento, cobertura e orçamento com a curadoria técnica da Klout.',
  pageType: 'WebPage',
  image: '/images/einstein_01-1280.avif',
  mainEntity: serviceNode(
    '/para-voce',
    'Consultoria individual em planos de saúde',
    'Consultoria personalizada em planos de saúde para pessoas e famílias',
    'Análise consultiva de rotina, rede de atendimento, cobertura e orçamento para orientar decisões individuais em planos de saúde.',
    'PeopleAudience',
  ),
});

export const kloutCompaniesSchema = buildKloutPageSchema({
  path: '/para-empresas',
  title: 'Para Empresas | Klout',
  description:
    'A Klout apoia empresas na análise de contratos, custos, rede credenciada e alternativas para planos de saúde corporativos.',
  pageType: 'WebPage',
  image: '/images/companies_hero_consulting.webp',
  mainEntity: serviceNode(
    '/para-empresas',
    'Consultoria em planos de saúde corporativos',
    'Consultoria em benefícios corporativos e planos de saúde empresariais',
    'Análise de contrato, rede credenciada, custo, previsibilidade e alternativas para benefícios de saúde corporativos.',
    'BusinessAudience',
  ),
});

export const kloutAnalysisSchema = buildKloutPageSchema({
  path: '/analise',
  title: 'Solicitar Análise | Klout',
  description:
    'Solicite uma análise da Klout para comparar planos de saúde, revisar custos e entender alternativas adequadas ao seu perfil.',
  pageType: 'ContactPage',
  mainEntity: serviceNode(
    '/analise',
    'Análise consultiva de planos de saúde',
    'Solicitação de análise personalizada de planos de saúde',
    'Formulário para solicitar análise consultiva de plano atual, custos, rede e alternativas de contratação.',
    'Audience',
  ),
});

const partnerNames = ['Alice', 'Porto', 'Bradesco', 'SulAmerica', 'Omint', 'Amil'];

export const kloutPartnersSchema = buildKloutPageSchema({
  path: '/parceiros',
  title: 'Parceiros | Klout',
  description:
    'Conheça a rede de parceiros da Klout e como a curadoria especializada conecta seguradoras, empresas e clientes com mais eficiência.',
  pageType: 'CollectionPage',
  mainEntity: {
    '@type': 'ItemList',
    '@id': `${siteUrl}/parceiros#partner-list`,
    name: 'Rede de parcerias Klout',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: partnerNames.length,
    itemListElement: partnerNames.map((name, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Organization',
        name,
      },
    })),
  },
});
