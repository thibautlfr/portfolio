// Ties a case study to the collaboration it was made for, so a testimonial is written once.

interface Named {
  name: string;
}

/** The collaboration a project's `client` names, matched on the company name. */
export function findCollaboration<T extends Named>(collaborations: readonly T[], client?: Named): T | undefined {
  return client && collaborations.find((collaboration) => collaboration.name === client.name);
}
