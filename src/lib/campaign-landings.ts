export type CampaignLanding = {
  family: 'custos' | 'beneficios';
  variant: string;
  landingId: string;
  thesis: 'klout' | 'bradesco' | 'alice';
  theme: 'ink' | 'paper' | 'graphite' | 'people' | 'balance' | 'bradesco' | 'alice';
  metaTitle: string;
  title: string;
  description: string;
  eyebrow: string;
  heroImage: string;
  heroAlt: string;
  brandLogo?: string;
  brandName?: string;
  brandLeadIn?: string;
  formTitle: string;
  formDescription: string;
  rolePlaceholder?: string;
  ctaLabel: string;
  sectionKicker: string;
  sectionTitle: string;
  sectionDescription: string;
  sectionImage?: string;
  sectionImageAlt?: string;
  criteriaKicker?: string;
  criteria: Array<{ title: string; text: string }>;
  finalTitle: string;
  finalContentCentered?: boolean;
};

export const campaignLandings: CampaignLanding[] = [
  {
    family: 'custos', variant: 'reajuste', landingId: 'b2b-custos-reajuste', thesis: 'klout', theme: 'ink',
    metaTitle: 'Reajuste do Plano de Saúde Empresarial | Klout',
    title: 'Antes do próximo reajuste, entenda o que o contrato realmente permite.',
    description: 'A Klout lê custos, rede, utilização e regras contratuais para orientar uma decisão empresarial mais clara.',
    eyebrow: 'Revisão de contrato empresarial', heroImage: '/images/campaign/reajuste.webp',
    heroAlt: 'Lideranças de RH e finanças revisando documentos de benefícios corporativos',
    formTitle: 'Solicite um diagnóstico inicial',
    formDescription: 'Conte o tamanho da empresa. A Klout retorna em até um dia útil para entender o cenário.',
    ctaLabel: 'Analisar meu cenário', sectionKicker: 'Antes de renovar',
    sectionTitle: 'Reajuste não deve ser uma informação recebida sem leitura.',
    sectionDescription: 'O diagnóstico organiza o que pesa no contrato atual e quais perguntas precisam ser respondidas antes de renovar, negociar ou comparar alternativas.',
    criteria: [
      { title: 'Histórico e regras', text: 'Leitura do contrato, composição e critérios que influenciam o reajuste.' },
      { title: 'Rede que importa', text: 'Hospitais, laboratórios e abrangência avaliados pelo uso real da equipe.' },
      { title: 'Próxima decisão', text: 'Direção clara para negociar, manter ou comparar sem decisão precipitada.' },
    ], finalTitle: 'O próximo reajuste pode começar com uma leitura melhor.',
  },
  {
    family: 'custos', variant: 'previsibilidade', landingId: 'b2b-custos-previsibilidade', thesis: 'klout', theme: 'paper',
    metaTitle: 'Previsibilidade em Planos de Saúde Empresariais | Klout',
    title: 'Custo previsível começa por uma escolha que a empresa consegue explicar.',
    description: 'Comparamos rede, contrato e desenho do benefício para alinhar proteção do time e controle financeiro.',
    eyebrow: 'Saúde corporativa com critério', heroImage: '/images/campaign/previsibilidade.webp',
    heroAlt: 'Gestores analisando custos e documentos de um benefício empresarial',
    formTitle: 'Converse com a Klout', formDescription: 'Uma primeira leitura para organizar contexto, porte e prioridade da empresa.',
    ctaLabel: 'Solicitar diagnóstico', sectionKicker: 'Clareza financeira',
    sectionTitle: 'Preço isolado não revela a qualidade de um benefício.',
    sectionDescription: 'A Klout aproxima o que o Financeiro precisa prever do que RH e colaboradores precisam reconhecer como cobertura útil.',
    criteria: [
      { title: 'Custo total', text: 'Mensalidade, coparticipação e regras observadas como uma estrutura única.' },
      { title: 'Uso provável', text: 'Rede e desenho avaliados a partir do perfil e da distribuição das vidas.' },
      { title: 'Decisão defensável', text: 'Uma recomendação que pode ser discutida com liderança e equipe.' },
    ], finalTitle: 'Transforme opções de mercado em uma decisão compreensível.',
  },
  {
    family: 'custos', variant: 'crescimento', landingId: 'b2b-custos-crescimento', thesis: 'klout', theme: 'graphite',
    metaTitle: 'Plano de Saúde para Empresas em Crescimento | Klout',
    title: 'O benefício precisa acompanhar o crescimento sem perder o controle.',
    description: 'Estruturamos decisões de saúde corporativa para o tamanho atual da empresa e para o próximo estágio da operação.',
    eyebrow: 'Benefício que acompanha a empresa', heroImage: '/images/campaign/crescimento.webp',
    heroAlt: 'Lideranças planejando o crescimento de uma empresa em São Paulo',
    formTitle: 'Estruture o próximo passo', formDescription: 'Informe o porte atual. A Klout entra em contato em até um dia útil.',
    ctaLabel: 'Falar sobre crescimento', sectionKicker: 'Escala responsável',
    sectionTitle: 'Crescer muda o risco, o perfil das vidas e a percepção do benefício.',
    sectionDescription: 'O desenho precisa continuar viável para o caixa e coerente com as pessoas que a empresa quer contratar e manter.',
    criteria: [
      { title: 'Porte atual', text: 'Leitura do momento da empresa e da composição das vidas.' },
      { title: 'Próxima fase', text: 'Escolhas preparadas para novas contratações e mudanças de perfil.' },
      { title: 'Sustentação', text: 'Custo e regras avaliados para não criar uma promessa difícil de manter.' },
    ], finalTitle: 'Planeje o benefício com a mesma seriedade do crescimento.',
  },
  {
    family: 'beneficios', variant: 'talentos', landingId: 'b2b-beneficios-talentos', thesis: 'klout', theme: 'people',
    metaTitle: 'Plano de Saúde para Atrair e Reter Talentos | Klout',
    title: 'Um benefício forte precisa ser percebido por quem você quer manter.',
    description: 'A Klout conecta rede, experiência de uso e viabilidade financeira à estratégia de pessoas da empresa.',
    eyebrow: 'Saúde corporativa para People', heroImage: '/images/campaign/talentos.webp',
    heroAlt: 'Liderança de pessoas conversando com profissionais em um escritório',
    formTitle: 'Avalie o benefício da empresa', formDescription: 'Compartilhe o porte da equipe e receba um retorno em até um dia útil.',
    ctaLabel: 'Iniciar diagnóstico', sectionKicker: 'Valor percebido',
    sectionTitle: 'Benefício relevante não é o mais caro. É o que faz sentido para o time.',
    sectionDescription: 'A leitura considera como rede, acesso, acomodação e experiência afetam a percepção de cuidado e a confiança na empresa.',
    criteria: [
      { title: 'Perfil das pessoas', text: 'Momento, distribuição e expectativas observados antes das opções.' },
      { title: 'Rede reconhecida', text: 'Acesso que representa melhoria concreta para o público interno.' },
      { title: 'Valor sustentável', text: 'Uma entrega percebida sem desorganizar o orçamento.' },
    ], finalTitle: 'Dê ao benefício uma função clara na estratégia de pessoas.',
  },
  {
    family: 'beneficios', variant: 'equilibrio', landingId: 'b2b-beneficios-equilibrio', thesis: 'klout', theme: 'balance',
    metaTitle: 'Benefícios para RH e Financeiro | Klout', title: 'RH e Financeiro não precisam defender lados opostos.',
    description: 'Uma leitura técnica transforma custo e experiência do colaborador em critérios para a mesma decisão.',
    eyebrow: 'Uma decisão, dois olhares', heroImage: '/images/campaign/equilibrio.webp',
    heroAlt: 'Lideranças de recursos humanos e finanças analisando um documento em conjunto',
    formTitle: 'Organize a decisão', formDescription: 'A Klout retorna em até um dia útil para compreender prioridades e contexto.',
    ctaLabel: 'Solicitar primeira leitura', sectionKicker: 'Convergência',
    sectionTitle: 'A melhor escolha precisa funcionar na planilha e na rotina das pessoas.',
    sectionDescription: 'O diagnóstico cria uma linguagem comum para comparar alternativas sem reduzir a discussão apenas a preço ou percepção.',
    criteria: [
      { title: 'Critério comum', text: 'Rede, regras e custo apresentados na mesma estrutura de decisão.' },
      { title: 'Risco conhecido', text: 'Limites e contrapartidas explicitados antes da contratação.' },
      { title: 'Direção interna', text: 'Argumentos claros para liderança, RH e Financeiro.' },
    ], finalTitle: 'Construa uma decisão que RH e Financeiro consigam sustentar.',
  },
  {
    family: 'beneficios', variant: 'bradesco-saude', landingId: 'b2b-beneficios-bradesco-saude', thesis: 'bradesco', theme: 'bradesco',
    metaTitle: 'Bradesco Saúde Empresarial | Klout', title: 'Bradesco Saúde empresarial com consultoria estratégica.',
    description: 'Ajudamos sua empresa a entender rede, abrangência e regras para avaliar a aderência do Bradesco Saúde ao contexto do seu negócio.',
    eyebrow: '', heroImage: '/images/campaign/bradesco-saude.webp',
    heroAlt: 'Consultoria avaliando opções de plano de saúde para uma empresa',
    brandLogo: '/images/logos_svgs/logo_bradesco.svg', brandName: 'Bradesco Saúde',
    brandLeadIn: '',
    formTitle: 'Avalie a aderência para sua empresa', formDescription: 'Informe o porte. A Klout retorna em até um dia útil para iniciar a análise.',
    rolePlaceholder: 'Selecionar',
    ctaLabel: 'Conhecer opções', sectionKicker: '',
    sectionTitle: 'Escolher a Bradesco Saúde é um bom ponto de partida, mas o contrato precisa fazer sentido.',
    sectionDescription: 'A Klout considera os perfis das vidas, rede necessária e estrutura que proporcione ao time um melhor benefício e à empresa, uma solução que compreenda seus objetivos e orçamento.',
    sectionImage: '/images/campaign/bradesco-saude-experiencia-digital.webp',
    sectionImageAlt: 'Mulher negra sorrindo enquanto utiliza um serviço de saúde pelo celular',
    criteriaKicker: '',
    criteria: [
      { title: 'Linha adequada', text: 'Avaliação das opções compatíveis com porte e expectativa da empresa.' },
      { title: 'Rede aplicável', text: 'Hospitais e laboratórios observados conforme localização e uso provável.' },
      { title: 'Regras claras', text: 'Condições apresentadas antes da decisão e da eventual proposta.' },
    ], finalTitle: 'Entenda se Bradesco Saúde é aderente ao contexto da empresa.',
    finalContentCentered: true,
  },
  {
    family: 'beneficios', variant: 'alice', landingId: 'b2b-beneficios-alice', thesis: 'alice', theme: 'alice',
    metaTitle: 'Alice para Empresas | Klout', title: 'Alice para empresas que querem tornar o cuidado mais próximo de People.',
    description: 'A Klout ajuda RH a avaliar como proposta de cuidado, rede e experiência se conectam ao perfil real da equipe.',
    eyebrow: 'Uma leitura para RH e People', heroImage: '/images/campaign/alice.webp',
    heroAlt: 'Profissional de People conversando sobre benefícios com uma colaboradora',
    brandLogo: '/images/logos_svgs/logo_alice.svg', brandName: 'Alice',
    formTitle: 'Entenda a aderência para o time', formDescription: 'Informe o porte da empresa. A Klout retorna em até um dia útil.',
    ctaLabel: 'Conversar sobre Alice', sectionKicker: 'Alice para empresas',
    sectionTitle: 'Experiência de cuidado também precisa funcionar na operação de RH.',
    sectionDescription: 'A avaliação considera perfil das pessoas, acesso, rede e o que a proposta representa na rotina do benefício.',
    criteria: [
      { title: 'Experiência do time', text: 'A proposta observada pela jornada que o colaborador realmente terá.' },
      { title: 'Operação de People', text: 'Aderência ao trabalho de RH, comunicação e acompanhamento do benefício.' },
      { title: 'Contexto da empresa', text: 'Porte, distribuição e necessidades considerados antes de avançar.' },
    ], finalTitle: 'Avalie Alice a partir da realidade das suas pessoas.',
  },
];

export function getCampaignLanding(family: string, variant: string) {
  return campaignLandings.find((landing) => landing.family === family && landing.variant === variant);
}
