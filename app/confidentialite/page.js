import LegalShell from '../_components/LegalShell';
import { LEGAL as L } from '../../lib/legal';

export const metadata = { title: 'Politique de confidentialité — Deux Toits' };

const sections = [
  {
    title: '1. Responsable du traitement',
    paras: [
      `Le responsable du traitement de vos données personnelles est ${L.editeur}, ${L.statut}, ${L.adresse} (SIRET : ${L.siret}). Contact : ${L.email}.`
    ]
  },
  {
    title: '2. Données que nous traitons',
    list: [
      `Compte : adresse email et mot de passe (stocké sous forme chiffrée par notre prestataire d'authentification, jamais en clair).`,
      `Espace famille : code famille, votre rôle (Toit A, Toit B ou spectateur).`,
      `Contenus que vous saisissez : jours de garde et demandes d'échange, dépenses (description, montant, payeur), notes du journal, pièces jointes (justificatifs).`,
      `Abonnement : statut de l'abonnement et identifiants de client chez Stripe. Nous ne voyons ni ne stockons votre numéro de carte bancaire.`,
      `Anti-abus de l'essai gratuit : une empreinte technique non réversible liée au moyen de paiement, pour éviter les essais gratuits répétés.`,
      `Données techniques : journaux de connexion et adresse IP, conservés par l'hébergeur pour la sécurité et le bon fonctionnement du service.`
    ]
  },
  {
    title: '3. Pourquoi nous les traitons',
    list: [
      `Fournir le service (compte, calendrier, dépenses, journal, export, notifications par email liées à l'activité de l'autre parent) : exécution du contrat.`,
      `Gérer l'abonnement, la facturation et les obligations comptables : exécution du contrat et obligation légale.`,
      `Sécuriser le service et lutter contre les abus (dont les essais gratuits répétés) : intérêt légitime.`
    ],
    paras: [`Nous n'utilisons vos données ni pour de la publicité, ni pour du profilage, et nous ne les vendons pas.`]
  },
  {
    title: '4. Informations concernant les enfants et données sensibles',
    paras: [
      `Le service ne demande aucune information sur les enfants. Le journal étant en texte libre, vous décidez de ce que vous y écrivez. Nous vous recommandons de ne pas y saisir de données de santé ni d'informations identifiantes qui ne sont pas strictement nécessaires.`,
      `Vous êtes responsable des contenus que vous saisissez et de leur partage avec l'autre parent et avec les spectateurs que vous invitez.`
    ]
  },
  {
    title: '5. Qui a accès à vos données',
    list: [
      `Les deux parents de l'espace famille voient l'ensemble des contenus de l'espace.`,
      `Les spectateurs (accès en lecture seule via le code spectateur) voient les mêmes contenus sans pouvoir les modifier. Un parent peut révoquer ces accès en régénérant le code.`,
      `Aucune autre famille ne peut voir vos données : l'accès est cloisonné par espace famille au niveau de la base de données.`,
      `L'éditeur n'accède aux données que pour l'administration technique et le support.`
    ]
  },
  {
    title: '6. Prestataires (sous-traitants)',
    list: [
      `Vercel Inc. : hébergement du site.`,
      `Supabase Inc. : base de données, authentification et stockage des pièces jointes (région : ${L.supabaseRegion}).`,
      `Stripe Payments Europe, Ltd. : paiement et gestion de l'abonnement.`,
      `Resend : envoi des emails (connexion, mot de passe oublié, notifications), serveurs dans l'Union européenne.`,
      `Google Fonts : chargement des polices d'affichage du site, ce qui transmet votre adresse IP à Google.`
    ]
  },
  {
    title: '7. Transferts hors de l\'Union européenne',
    paras: [
      `Certains de ces prestataires sont établis aux États-Unis ou peuvent y traiter des données. Ces transferts sont encadrés par des garanties appropriées (cadre de protection des données UE-États-Unis ou clauses contractuelles types de la Commission européenne).`
    ]
  },
  {
    title: '8. Durée de conservation',
    list: [
      `Contenus et compte : tant que votre compte est actif. Vous pouvez demander leur suppression à tout moment.`,
      `Après une demande de suppression, nous supprimons le compte et les contenus dans un délai d'un mois.`,
      `Factures et données comptables : 10 ans, conformément aux obligations légales.`,
      `Journaux techniques : durée limitée fixée par l'hébergeur.`
    ]
  },
  {
    title: '9. Sécurité',
    list: [
      `Connexion chiffrée (HTTPS) sur l'ensemble du site.`,
      `Cloisonnement des données par famille et rôle spectateur strictement en lecture seule.`,
      `Pièces jointes stockées dans un espace privé, accessibles uniquement par des liens temporaires.`
    ],
    paras: [`Aucun système n'est infaillible : en cas de violation de données susceptible de vous exposer à un risque, nous vous informerons et préviendrons la CNIL dans les délais légaux.`]
  },
  {
    title: '10. Vos droits',
    paras: [
      `Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Pour les exercer, écrivez à ${L.email} ; nous répondons dans un délai d'un mois.`,
      `Vous pouvez aussi introduire une réclamation auprès de la CNIL : www.cnil.fr, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.`
    ]
  },
  {
    title: '11. Cookies et traceurs',
    paras: [
      `${L.siteName} utilise uniquement le stockage technique strictement nécessaire à son fonctionnement (maintien de votre session de connexion). Nous n'utilisons ni cookies publicitaires ni outil de mesure d'audience, c'est pourquoi aucun bandeau de consentement n'est affiché.`
    ]
  },
  {
    title: '12. Modifications',
    paras: [
      `Cette politique peut évoluer. La date de dernière mise à jour figure en haut de la page ; en cas de changement important, nous vous en informerons.`
    ]
  }
];

export default function Page() {
  return (
    <LegalShell
      title="Politique de confidentialité"
      updated={L.derniereMiseAJour}
      sections={sections}
    />
  );
}
