import LegalShell from '../_components/LegalShell';
import { LEGAL as L } from '../../lib/legal';

export const metadata = { title: 'Mentions légales — Deux Toits' };

const sections = [
  {
    title: 'Éditeur du site',
    paras: [`Le site ${L.siteUrl} est édité par ${L.editeur}, ${L.statut}.`],
    list: [
      `SIRET : ${L.siret}`,
      `Adresse : ${L.adresse}`,
      `Email : ${L.email}`,
      `Directeur de la publication : ${L.directeurPublication}`,
      `TVA : ${L.tva}`
    ]
  },
  {
    title: 'Hébergement et prestataires techniques',
    list: [
      `Hébergement du site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).`,
      `Base de données et authentification : Supabase Inc. (supabase.com), région ${L.supabaseRegion}.`,
      `Paiement : Stripe Payments Europe, Ltd., Dublin, Irlande (stripe.com). Les données de carte bancaire sont traitées uniquement par Stripe et ne sont jamais stockées par ${L.siteName}.`,
      `Envoi des emails : Resend (resend.com), serveurs situés dans l'Union européenne (Irlande).`
    ]
  },
  {
    title: 'Propriété intellectuelle',
    paras: [
      `Le nom ${L.siteName}, le logo, la charte graphique, les textes et le code du site sont la propriété de l'éditeur. Toute reproduction ou réutilisation sans autorisation écrite préalable est interdite.`,
      `Les contenus que vous saisissez dans le service (jours de garde, dépenses, notes du journal, pièces jointes) restent les vôtres.`
    ]
  },
  {
    title: 'Données personnelles',
    paras: [
      `Le traitement de vos données personnelles est décrit dans la politique de confidentialité, accessible à l'adresse ${L.siteUrl}/confidentialite.`
    ]
  },
  {
    title: 'Contact',
    paras: [`Pour toute question, vous pouvez écrire à : ${L.email}.`]
  },
  {
    title: 'Médiation de la consommation',
    paras: [
      `En cas de litige avec ${L.siteName} que nous n'aurions pas pu résoudre directement, vous pouvez recourir gratuitement au médiateur de la consommation suivant : ${L.mediateur}.`
    ]
  }
];

export default function Page() {
  return <LegalShell title="Mentions légales" updated={L.derniereMiseAJour} sections={sections} />;
}
