export interface PermissionsScreenMessages {
  header: {
    title: string;
    subtitle: string;
  };
  privacy: {
    title: string;
    points: {
      localData: string;
      noCloud: string;
      userControl: string;
      revokable: string;
    };
  };
  permissions: {
    statusTitle: string;
    types: {
      sleep: string;
      heartRate: string;
      steps: string;
      workout: string;
    };
  };
  benefits: {
    title: string;
    smartInsights: {
      title: string;
      description: string;
    };
    autoTracking: {
      title: string;
      description: string;
    };
  };
  actions: {
    grantAccess: string;
    requesting: string;
    continueWithout: string;
  };
  alerts: {
    permissionsGranted: {
      title: string;
      message: string;
      continue: string;
    };
    partialPermissions: {
      title: string;
      message: string;
      continue: string;
      tryAgain: string;
    };
    continueWithout: {
      title: string;
      message: string;
      goBack: string;
      continue: string;
    };
    unsupportedPlatform: {
      title: string;
      android: string;
      iosSimulator: string;
      iosDevice: string;
      web: string;
      continue: string;
    };
    permissionError: {
      title: string;
      message: string;
      tryAgain: string;
      continueAnyway: string;
      skip: string;
    };
  };
}

export type Language = 'en' | 'ru';

export interface PermissionItem {
  key: string;
  icon: string;
  granted: boolean;
}