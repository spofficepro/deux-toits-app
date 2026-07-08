# Deux Toits — guide de mise en ligne

Ce projet est un Next.js complet : authentification, base de données partagée
par famille, et paiement Stripe avec essai gratuit de 30 jours (anti-abus par
empreinte de carte bancaire). Il te reste 3 comptes à créer (gratuits pour
démarrer) et une vingtaine de minutes de configuration.

## 1. Créer le projet Supabase (base de données + authentification)

1. Va sur https://supabase.com → crée un compte → "New project".
2. Une fois le projet créé, va dans **SQL Editor** → colle le contenu de
   `supabase/schema.sql` → **Run**. Cela crée toutes les tables et les
   règles de sécurité (chaque famille ne voit que ses propres données).
3. Va dans **Authentication > Providers** → laisse "Email" activé.
   Dans **Authentication > Settings**, tu peux désactiver la confirmation
   par email pour tester plus vite (à réactiver avant le vrai lancement).
4. Va dans **Project Settings > API** → récupère :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secrète, jamais
     exposée au navigateur — elle n'est utilisée que dans le webhook Stripe)
5. Active le temps réel (Realtime) sur les 3 tables `calendar_days`,
   `expenses`, `journal_entries` : **Database > Replication > supabase_realtime**
   → coche ces 3 tables. C'est ce qui permet à l'autre parent de voir les
   changements instantanément.

## 2. Créer le produit Stripe (paiement + essai gratuit)

1. Va sur https://stripe.com → crée un compte (mode test au départ).
2. Va dans **Product catalog** → crée un produit "Deux Toits — abonnement
   famille" avec un prix récurrent mensuel de **10,00 €**.
3. Copie l'ID du prix (commence par `price_...`) → `STRIPE_PRICE_ID`.
4. Va dans **Developers > API keys** → copie la clé secrète (`sk_test_...`
   puis `sk_live_...` une fois en production) → `STRIPE_SECRET_KEY`.
5. Le webhook (`STRIPE_WEBHOOK_SECRET`) sera créé à l'étape 4 ci-dessous,
   une fois le site déployé (Stripe a besoin d'une URL publique).

## 3. Déployer sur Vercel

1. Mets ce dossier sur GitHub (crée un nouveau repo, pousse le code).
2. Va sur https://vercel.com → connecte ton compte GitHub → "Import Project"
   → sélectionne le repo.
3. Dans les réglages du projet Vercel, va dans **Environment Variables** et
   ajoute toutes les variables listées dans `.env.example` (sauf
   `STRIPE_WEBHOOK_SECRET`, qui vient juste après).
4. Déploie. Vercel te donne une URL du type `deux-toits.vercel.app` —
   mets-la dans `NEXT_PUBLIC_SITE_URL` (redéploie après l'avoir ajoutée).
5. Tu pourras brancher ton propre nom de domaine plus tard dans
   **Vercel > Domains** (ex : deuxtoits.fr, ~10€/an chez Gandi ou Namecheap).

## 4. Connecter le webhook Stripe

1. Dans Stripe : **Developers > Webhooks > Add endpoint**.
2. URL : `https://tondomaine.fr/api/stripe/webhook` (ou ton URL Vercel).
3. Événements à écouter : `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. Une fois créé, Stripe te donne un "Signing secret" (`whsec_...`) →
   mets-le dans `STRIPE_WEBHOOK_SECRET` sur Vercel → redéploie.

## 5. Tester de bout en bout

1. Va sur ton site → "Essai gratuit 30 jours" → crée un compte.
2. Crée un espace famille, choisis "Toit A".
3. Tu es redirigé vers Stripe Checkout (utilise une carte de test Stripe :
   `4242 4242 4242 4242`, n'importe quelle date future, n'importe quel CVC).
4. Une fois payé, tu arrives sur l'app. Ouvre un navigateur en navigation
   privée, crée un 2e compte, "Rejoindre un espace existant" avec le code
   affiché à l'étape 3 → choisis "Toit B" → tu dois voir le même calendrier.
5. Quand tout fonctionne en mode test, repasse en mode **live** dans Stripe
   (nouvelles clés `sk_live_...`, nouveau webhook en mode live) pour
   accepter de vrais paiements.

## Anti-abus de l'essai gratuit — comment ça marche

À chaque nouvel abonnement, le webhook récupère l'empreinte unique de la
carte bancaire utilisée (`card.fingerprint`, fournie par Stripe — jamais le
numéro de carte lui-même). Si cette empreinte a déjà servi à un essai
gratuit par le passé, l'essai est automatiquement écourté et la première
facture est prélevée immédiatement. Ce n'est pas infaillible à 100% (une
carte différente contourne le système), mais ça bloque le cas le plus
fréquent : quelqu'un qui recrée un compte avec la même carte.

## Prochaines fonctionnalités possibles (roadmap)

Des idées classées par effort, inspirées des apps de coparentalité les
plus utilisées aux États-Unis (OurFamilyWizard, AppClose) :

- **Demandes d'échange de garde** — un parent propose un échange de jour,
  l'autre accepte ou refuse en un clic (au lieu de se mettre d'accord par
  SMS à côté).
- **Pièces jointes dans le journal** — ordonnances, bulletins scolaires,
  photos, rattachées à une note datée.
- **Export PDF du journal et des dépenses** — utile en cas de médiation
  ou de procédure judiciaire (valeur ajoutée forte, argument de vente).
- **Rappels automatiques** — anniversaire, vaccins, rentrée scolaire.
- **Compte spectateur (avocat, médiateur, grand-parent)** — accès lecture
  seule à l'espace famille.
- **Notifications par email** quand l'autre parent ajoute une dépense ou
  une note (garde les deux parents engagés sans devoir rouvrir l'app).

Je te conseille de lancer sans ces fonctionnalités, d'écouter les 5-10
premières familles utilisatrices, et de prioriser en fonction de ce qui
revient le plus souvent — plutôt que de tout construire d'avance.
