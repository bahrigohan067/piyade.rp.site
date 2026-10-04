import { ROLES } from './constants';

export function getUserRoleLevel(roles: string[]) {
  const isKurucu = roles.includes(ROLES.KURUCU);
  const isUstYonetim = roles.includes(ROLES.UST_YONETIM);
  const isYonetici = roles.includes(ROLES.YONETICI);
  const isSeniorStaff = roles.includes(ROLES.SENIOR_STAFF);
  const isStaff = roles.includes(ROLES.STAFF);
  const isTrialStaff = roles.includes(ROLES.TRIAL_STAFF);
  const isWhitelist = roles.includes(ROLES.WHITELIST);
  const isIllegal = roles.includes(ROLES.ILLEGAL);
  const isStaffAny = isKurucu || isUstYonetim || isYonetici || isSeniorStaff || isStaff || isTrialStaff;
  const isKayitsiz = roles.includes(ROLES.KAYITSIZ) || (!isWhitelist && !isStaffAny);

  const canViewOtherGuilds = isKurucu;
  const canIssueWarning = isKurucu || isUstYonetim || isYonetici || isSeniorStaff || isStaff;
  const canViewAllMembers = isStaffAny;
  const canAccessIllegalGang = isIllegal;
  const onlyRegistration = isKayitsiz && !isWhitelist && !isStaffAny;

  let redirectPath = '/kayit';
  if (isKurucu) {
    redirectPath = '/kurucu';
  } else if (isUstYonetim || isYonetici || isSeniorStaff || isStaff || isTrialStaff) {
    redirectPath = '/yetkili';
  } else if (isWhitelist) {
    redirectPath = '/panel';
  } else {
    redirectPath = '/kayit';
  }

  return {
    isKurucu,
    isUstYonetim,
    isYonetici,
    isSeniorStaff,
    isStaff,
    isTrialStaff,
    isStaffAny,
    isWhitelist,
    isIllegal,
    isKayitsiz,
    onlyRegistration,
    canViewOtherGuilds,
    canIssueWarning,
    canViewAllMembers,
    canAccessIllegalGang,
    redirectPath,
  };
}
