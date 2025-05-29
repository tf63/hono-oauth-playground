import { createRoute } from 'honox/factory'

export default createRoute((c) => {
    return c.render(
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">OAuth Sample</h1>
                <p className="mb-6 text-center text-sm text-slate-500">認可サーバーにリダイレクトされます</p>
                <form method="post">
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-400 py-2 text-white transition hover:bg-indigo-500"
                    >
                        {'Go to Authorization Server'}
                    </button>
                </form>
            </div>
        </div>
    )
})

export const POST = createRoute((c) => {
    return c.redirect('http://localhost:3001')
})
