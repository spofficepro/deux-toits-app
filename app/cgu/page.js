import LegalShell from '../_components/LegalShell';
import { LEGAL as L } from '../../lib/legal';

export const metadata = { title: 'Conditions générales d\'utilisation — Deux Toits' };

const sections = [
  {
    title: '1. Objet',
    paras: [
      `Les présentes conditions générales (les « CGU ») régissent l'utilisation du service ${L.siteName}, accessible à l'adresse ${L.siteUrl} et édité par ${L.editeur} (l'« Éditeur »). En créant un compte, vous déclarez les avoir lues et acceptées.`
    ]
  },
  {
    title: '2. Description du service',
    paras: [
      `${L.siteName} est un espace partagé et neutre destiné aux parents séparés. Il permet de gérer un calendrier de garde (avec propositions d'échange de jours), de suivre des dépenses partagées avec le calcul du solde, de tenir un journal daté et d'exporter ces informations.`
    ]
  },
  {
    title: '3. Compte et accès',
    list: [
      `Le service est réservé aux personnes majeures.`,
      `Chaque parent crée son propre compte avec une adresse email et un mot de passe personnels. Un espace famille est rattaché à un « code famille » à communiquer à l'autre parent.`,
      `Chaque famille dispose aussi d'un « code spectateur » permettant de donner un accès en lecture seule à une tierce personne (avocat, médiateur, proche). Un parent peut le régénérer à tout moment, ce qui supprime les accès spectateur existants.`,
      `Vous êtes responsable de la confidentialité de vos identifiants et de ces codes, et des accès que vous accordez.`,
      `Vous vous engagez à fournir des informations exactes.`
    ]
  },
  {
    title: '4. Portée du service',
    paras: [
      `${L.siteName} est un outil d'organisation. Il ne fournit aucun conseil juridique, ne remplace ni une décision de justice, ni une convention parentale, ni l'accord entre les parents, et ne garantit pas la valeur probante des informations enregistrées ou exportées devant une juridiction. Les parents restent seuls responsables du respect des décisions et accords qui les concernent.`
    ]
  },
  {
    title: '5. Contenus et usages interdits',
    paras: [
      `Vous êtes seul responsable des contenus que vous saisissez et des pièces jointes que vous téléversez (PDF, JPEG, PNG ou WebP, 5 Mo maximum chacune).`,
      `Il est interdit de publier des contenus illicites, diffamatoires ou portant atteinte aux droits de tiers, d'utiliser le service pour harceler ou menacer l'autre parent, de tenter d'accéder aux données d'une autre famille ou de perturber le fonctionnement du service.`,
      `Nous vous recommandons de ne pas saisir de données sensibles non nécessaires (en particulier des informations de santé concernant les enfants).`,
      `L'Éditeur peut suspendre ou supprimer un compte en cas de manquement grave à ces règles.`
    ]
  },
  {
    title: '6. Prix et paiement',
    paras: [
      `L'abonnement est de ${L.prix} par mois et par foyer. Il est partagé entre les deux parents d'un même espace famille. ${L.tva}`,
      `Le paiement est traité de façon sécurisée par Stripe et prélevé automatiquement chaque mois. Une facture ou un reçu est disponible via la gestion de l'abonnement.`,
      `Les prix peuvent évoluer. Tout changement vous est notifié à l'avance et ne s'applique pas à la période déjà payée.`
    ]
  },
  {
    title: '7. Essai gratuit',
    paras: [
      `Le service est offert gratuitement pendant ${L.essaiJours} jours. Une carte bancaire est demandée pour activer l'essai ; aucun prélèvement n'a lieu avant la fin de cette période.`,
      `À l'issue de l'essai, l'abonnement payant démarre automatiquement, sauf si vous avez résilié avant la fin des ${L.essaiJours} jours. Un seul essai gratuit est accordé par personne ; un dispositif technique empêche d'en cumuler plusieurs avec le même moyen de paiement.`
    ]
  },
  {
    title: '8. Résiliation',
    paras: [
      `Vous pouvez résilier à tout moment depuis le lien « Gérer l'abonnement » de l'application, sans frais ni préavis. La résiliation prend effet à la fin de la période en cours.`,
      `Vous pouvez demander la suppression de votre compte et de vos données en écrivant à ${L.email}.`
    ]
  },
  {
    title: '9. Droit de rétractation',
    paras: [
      `Si vous êtes un consommateur, vous disposez d'un délai de 14 jours à compter de la souscription pour vous rétracter, sans avoir à motiver votre décision (article L221-18 du Code de la consommation). Ce délai s'exerce pendant la période d'essai gratuite, aucun paiement n'étant dû avant son terme. Pour l'exercer, résiliez depuis l'application ou écrivez à ${L.email}.`
    ]
  },
  {
    title: '10. Disponibilité et responsabilité',
    paras: [
      `Nous mettons en oeuvre les moyens raisonnables pour assurer l'accès au service et la sécurité des données, mais le service est fourni « en l'état » et peut être interrompu pour maintenance ou en cas d'incident. Il n'est pas garanti sans interruption ni sans erreur.`,
      `Dans les limites autorisées par la loi, la responsabilité de l'Éditeur est limitée aux dommages directs et ne couvre pas les pertes indirectes (par exemple un jour de garde mal enregistré ou une notification non reçue). Nous vous conseillons de conserver vos propres justificatifs. Ces limites ne s'appliquent pas en cas de faute lourde ou dolosive, ni lorsque la loi l'interdit.`
    ]
  },
  {
    title: '11. Données personnelles',
    paras: [
      `Le traitement de vos données est décrit dans la politique de confidentialité : ${L.siteUrl}/confidentialite.`
    ]
  },
  {
    title: '12. Modification des CGU',
    paras: [
      `Les CGU peuvent évoluer. En cas de changement important, vous en serez informé par email ou dans l'application avant leur entrée en vigueur. La poursuite de l'utilisation du service vaut acceptation des nouvelles CGU.`
    ]
  },
  {
    title: '13. Droit applicable et litiges',
    paras: [
      `Les CGU sont soumises au droit français. En cas de litige, contactez-nous d'abord à ${L.email} pour rechercher une solution amiable. Vous pouvez aussi recourir gratuitement au médiateur de la consommation : ${L.mediateur}.`,
      `À défaut d'accord, les tribunaux français sont compétents, sous réserve des règles protectrices applicables aux consommateurs.`
    ]
  }
];

export default function Page() {
  return (
    <LegalShell
      title="Conditions générales d'utilisation"
      updated={L.derniereMiseAJour}
      sections={sections}
    />
  );
}
