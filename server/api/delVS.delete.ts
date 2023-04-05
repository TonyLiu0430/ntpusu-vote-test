import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const email = session['user']['email']
    const studentId = email.substring(1, 10)

    const admin = await prisma.admin.findUnique({
        where: { id: parseInt(studentId) },
    })

    if (!admin) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const query = getQuery(event)
    const id = parseInt(query.id as string)

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request'
        })
    }

    const VS = await prisma.voteSession.findUnique({
        where: { id: id },
    })

    if (!VS) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found'
        })
    }

    const candidates = await prisma.candidate.findMany({
        where: { voteSessionId: VS.id },
    })

    for (const candidate of candidates) {
        await prisma.ballot.deleteMany({
            where: { candidateId: candidate.id },
        })
    }

    await prisma.candidate.deleteMany({
        where: { voteSessionId: VS.id },
    })

    await prisma.voteSession.delete({
        where: { id: id },
    })

    return {}
})