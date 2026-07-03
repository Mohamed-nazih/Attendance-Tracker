export const DEFAULT_CLASS_TEACHER = {
  name: 'Class Teacher',
  username: 'classteacher',
  email: 'classteacher@college.edu',
  password: 'ClassTeacher@123',
};

export const LOGIN_DOMAIN = 'college.edu';

export function usernameToEmail(username) {
  const value = username.trim().toLowerCase();
  return value.includes('@') ? value : `${value}@${LOGIN_DOMAIN}`;
}

export function emailToUsername(email) {
  return email.split('@')[0];
}
