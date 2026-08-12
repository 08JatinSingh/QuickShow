import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { dateFormat } from '../../lib/dateFormat'
import { useAppContext } from '../../context/AppContext'

const ListBookings = () => {
    const currency = import.meta.env.VITE_CURRENCY

    const { axios, getToken, user } = useAppContext()

    const [bookings, setBookings] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const getAllBookings = async () => {
        try {
            const { data } = await axios.get('/api/admin/all-bookings', {
                headers: {
                    Authorization: `Bearer ${await getToken()}`
                }
            })

            if (data.success) {
                setBookings(data.bookings || [])
            } else {
                console.error('Failed to fetch bookings:', data.message)
                setBookings([])
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
            setBookings([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            getAllBookings()
        }
    }, [user])

    if (isLoading) {
        return <Loading />
    }

    return (
        <>
            <Title text1="List" text2="Bookings" />

            <div className="max-w-4xl mt-6 overflow-x-auto">
                <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
                    <thead>
                        <tr className="bg-primary/20 text-left text-white">
                            <th className="p-2 font-medium pl-5">
                                User Name
                            </th>

                            <th className="p-2 font-medium">
                                Movie Name
                            </th>

                            <th className="p-2 font-medium">
                                Show Time
                            </th>

                            <th className="p-2 font-medium">
                                Seats
                            </th>

                            <th className="p-2 font-medium">
                                Amount
                            </th>
                        </tr>
                    </thead>

                    <tbody className="text-sm font-light">
                        {bookings.length > 0 ? (
                            bookings.map((item, index) => (
                                <tr
                                    key={item._id || index}
                                    className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
                                >
                                    <td className="p-2 min-w-45 pl-5">
                                        {item.user?.name || 'Unknown User'}
                                    </td>

                                    <td className="p-2">
                                        {item.show?.movie?.title || 'Unknown Movie'}
                                    </td>

                                    <td className="p-2">
                                        {item.show?.showDateTime
                                            ? dateFormat(item.show.showDateTime)
                                            : 'N/A'}
                                    </td>

                                    <td className="p-2">
                                        {Array.isArray(item.bookedSeats)
                                            ? item.bookedSeats.join(', ')
                                            : 'N/A'}
                                    </td>

                                    <td className="p-2">
                                        {currency} {item.amount}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="p-6 text-center text-gray-400"
                                >
                                    No bookings found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default ListBookings;