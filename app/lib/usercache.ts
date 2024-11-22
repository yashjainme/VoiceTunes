export const userIdCache = new Map<string, string>();

export async function getUserId(email: string, prismaClient: any): Promise<string> {
    const cachedId = userIdCache.get(email);
    if (cachedId) return cachedId;

    const user = await prismaClient.user.findUniqueOrThrow({
        where: { email },
        select: { id: true }
    });

    userIdCache.set(email, user.id);
    return user.id;
}
