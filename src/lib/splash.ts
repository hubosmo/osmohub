// Chave da sessão que marca "a abertura já foi mostrada" e o script que a lê antes do primeiro quadro.
export const CHAVE_SPLASH = "osmo-splash-shown";

// Roda no HTML (layout raiz), antes da hidratação: quem já viu a abertura nesta sessão não vê o overlay nem por um instante
export const SCRIPT_SPLASH_JA_VISTO = `try{if(sessionStorage.getItem("${CHAVE_SPLASH}"))document.documentElement.setAttribute("data-splash","visto")}catch(e){}`;
