# 🌳 YGGDRASIL — Cartographie 3D du Business Plan

> Chaque nœud N(x,y,z) représente une entité business. Chaque arête représente une dépendance ou possibilité ouverte par un nœud parent.

## Repère spatial

- **Axe X** : Profondeur technique (0 = surface UI, 100 = infrastructure noyau)
- **Axe Y** : Portée business (0 = single user, 100 = marketplace multi-tenant)
- **Axe Z** : Maturité (0 = idée, 50 = prototypé, 100 = production)

---

## NŒUD 0 — L'Étincelle (Z=100, réalisé)

### N(0, 0, 100) — Layout Separation
- Marketing layout `(marketing)` vs Dashboard layout `(app)`
- AtelierNav/AtelierFooter supprimés de StandbyBanner + ClientDashboard
- Remplacés par headers/footers privés minimalistes
- **Ouvre vers**: N(10, 0, 100) i18n, N(20, 0, 100) RBAC

### N(10, 0, 100) — i18n réel (FR/EN)
- next-intl middleware câblé (createMiddleware + auth gate combiné)
- NextIntlClientProvider dans atelier layout
- Messages en.json + fr.json (nav, footer, CTA)
- Bouton FR/EN fonctionne (router.replace avec locale)
- Routes privées (console, admin, agency) = English-only (bypass i18n)
- **Ouvre vers**: N(15, 20, 50) Traduction complète des pages publiques, N(10, 30, 50) i18n des emails/WhatsApp

### N(20, 50, 100) — RBAC Matrix
- 10 rôles: super_admin(100), admin(50), agency-admin(40), company-admin(30), manager(20), analyst(10), viewer(0)
- 3 rôles legacy: legacy_user_v1, legacy_trial, legacy_beta (niveau 0, fail-closed)
- 23 permissions granulaires (console:*, agency:*, admin:*, users:*, reports:*, alerts:*, billing:*, audit:*, master:code)
- Helpers: hasPermission, hasAnyPermission, getRoleLevel, canRoleAccess
- **Ouvre vers**: N(30, 50, 100) Master Codes, N(25, 60, 50) Permission UI dans admin

### N(30, 100, 100) — Master Codes Admin
- Générateur HARCH-XXXXX-XXXXX-XXXXX (SHA-256 + salt, timingSafeEqual)
- Code unique usage, TTL 24h, anti-brute-force (5/IP/10min)
- Route POST /api/auth/activate-master
- Script scripts/generate-master-code.ts + scripts/create-owner.ts
- **Ouvre vers**: N(40, 100, 50) Revocation temps réel, N(35, 80, 50) Audit trail super_admin

---

## NŒUD 1 — Les Branches (Z=50, à développer)

### N(40, 100, 50) — Revocation temps réel
- L'admin peut révoquer un accès instantanément (session JWT invalidée)
- Besoin: WebSocket push ou polling pour déconnecter l'utilisateur actif
- Dépend de: N(30) Master Codes, N(20) RBAC

### N(35, 80, 50) — Audit trail super_admin
- Toutes les actions super_admin loggées séparément
- Export immutable (append-only, pas de update/delete)
- Dépend de: N(30) Master Codes, N(20) RBAC

### N(15, 20, 50) — Traduction complète
- 90 pages publiques à traduire en FR
- Messages fr.json étendu + contenu dynamique
- Dépend de: N(10) i18n

### N(25, 60, 50) — Permission UI
- Interface admin pour gérer les permissions par utilisateur
- Matrice visuelle rôle × permission
- Dépend de: N(20) RBAC

### N(50, 40, 30) — Système d'invitation
- Admin crée compte → génère lien d'invitation unique
- URL /atelier/invite/[token] → set password page
- Token TTL 7 jours, single-use
- Email automatique si SMTP configuré
- Dépend de: N(20) RBAC, N(30) Master Codes

### N(60, 70, 20) — Système de facturation B2B
- Plans: emergence 15K, corporate 40K, sovereign 75K MAD/mo
- Trial 7 jours configurable
- Stripe ou virement bancaire (pas de carte pour le marché marocain)
- Dépend de: N(50) Invitations, N(20) RBAC

### N(70, 90, 10) — Marketplace d'agences
- Les agences peuvent créer des sous-clients (B2B2B)
- White-label: logo, couleurs, domaine personnalisé
- Quotas par plan (déjà implémenté: consumeQuota atomique)
- Dépend de: N(60) Facturation, N(20) RBAC

---

## NŒUD 2 — Les Feuilles (Z=10, vision future)

### N(80, 100, 10) — API publique (REST + GraphQL)
- Documentation OpenAPI auto-générée
- Clés API par client (déjà: /api/api-keys)
- Rate limiting par plan
- Webhooks sortants (déjà: /api/webhooks)

### N(90, 100, 5) — Mobile app (React Native)
- Push notifications pour alertes critiques
- Offline mode pour dashboards
- Biometric auth

### N(100, 100, 5) — AI fine-tuning Darija
- Fine-tune GLM-4 sur corpus Darija marocain
- Modèle propriétaire Harch-NLP
- Remplace le lexique basique actuel (darija.ts)

---

## La Règle de la Boucle Infinie

> À chaque cycle, le Sub-Agent CATALYST sélectionne le nœud de Z le plus bas
> qui a ses dépendances satisfaites, et le pousse vers Z=100.
> Chaque nœud complété ouvre 2-3 nouveaux nœuds enfants.
> Le graphe ne converge jamais — il s'étend indéfiniment.

### Ordre de priorité Catalyst (prochains cycles):
1. N(50, 40, 30) — Système d'invitation (dépendances satisfaites)
2. N(25, 60, 50) — Permission UI admin
3. N(40, 100, 50) — Revocation temps réel
4. N(35, 80, 50) — Audit trail super_admin
5. N(15, 20, 50) — Traduction FR complète
6. N(60, 70, 20) — Facturation B2B
7. N(70, 90, 10) — Marketplace d'agences
8. N(80, 100, 10) — API publique
9. N(90, 100, 5) — Mobile app
10. N(100, 100, 5) — AI fine-tuning Darija
