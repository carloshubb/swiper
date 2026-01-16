import { AccountTypes } from '../enums/account-type.enum';
import { GuruRegistrationRoute } from '../enums/guru-registration-route.enum';
import { UserRegistrationRoute } from '../enums/user-registration-route.enum';

const UnmatchedRouteStatuses: { [key in keyof typeof UserRegistrationRoute]?: boolean } = {
  accountDetails: false,
  verify: false,
  referralCode: false,
  maps: false,
  birthday: false,
  interests: false,
  photos: false,
  skipRegistration: false,
  preferredLang: false,
  gender: false,
  interestedGender: false,
  datingPreferences: false,
  goalsInterests: false,
  ageHeightWeight: false,
  faceEthnicity: false,
  bustWaistHip: false,
  spenderPresentMuscleFat: false,
  dominancePowerConfidence: false,
  swipe: false,
  summary: false,
  preferenceVsSwipes: false,
  accountSetup: false,
  accounts: false,
  calendar: false,
  congratulations: false,
};

const MatcherRouteStatuses: { [key in keyof typeof GuruRegistrationRoute]?: boolean } = {
  accountDetails: false,
  verify: false,
  referralCode: false,
  maps: false,
  birthday: false,
  interests: false,
  preferredLang: false,
  backgroundCheck: false,
  moneyGoals: false,
};

export const RouteStatuses: {
  [accountType in keyof typeof AccountTypes]?: {
    [route in keyof (typeof UserRegistrationRoute & typeof GuruRegistrationRoute)]?: boolean;
  };
} = {
  unmatched: UnmatchedRouteStatuses,
  matcher: MatcherRouteStatuses,
};
