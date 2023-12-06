export type Role = 'Employee' | 'Admin' | 'ProjectManager';

export enum RoleEnum {
  Employee = 'Employee',
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
}

export type EventType = 'RemoteWork' | 'PaidLeave';

export enum EventTypeEnum {
  RemoteWork = 'RemoteWork',
  PaidLeave = 'PaidLeave',
}

export type EventStatus = 'Pending' | 'Accepted' | 'Declined';

export enum EventStatusEnum {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Declined = 'Declined',
}

export enum ValidateEnum {
  Validate = 'Validate',
  Decline = 'Decline',
}
