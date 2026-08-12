import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { CheckIcon, DeleteIcon, StarIcon } from 'lucide-react'
import { kConverter } from '../../lib/kConverter'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddShows = () => {
    const { axios, getToken, user, image_base_url } = useAppContext()

    const currency = import.meta.env.VITE_CURRENCY

    const [nowPlayingMovies, setNowPlayingMovies] = useState([])
    const [selectedMovie, setSelectedMovie] = useState(null)
    const [dateTimeSelection, setDateTimeSelection] = useState({})
    const [dateTimeInput, setDateTimeInput] = useState('')
    const [showPrice, setShowPrice] = useState('')
    const [addingShow, setAddingShow] = useState(false)

    const [isLoading, setIsLoading] = useState(true)
    const [fetchError, setFetchError] = useState('')

    // Fetch now playing movies
    const fetchNowPlayingMovies = async () => {
        try {
            setIsLoading(true)
            setFetchError('')

            const token = await getToken()

            const { data } = await axios.get('/api/show/now-playing', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (data.success) {
                setNowPlayingMovies(data.movies || [])
            } else {
                setNowPlayingMovies([])
                setFetchError(data.message || 'Failed to load movies')
            }

        } catch (error) {
            console.error('Error fetching movies:', error)

            setNowPlayingMovies([])

            setFetchError(
                error.response?.data?.message ||
                'Failed to load now playing movies'
            )
        } finally {
            setIsLoading(false)
        }
    }

    // Add date and time
    const handleDateTimeAdd = () => {
        if (!dateTimeInput) {
            toast.error('Please select a date and time')
            return
        }

        const [date, time] = dateTimeInput.split('T')

        if (!date || !time) {
            toast.error('Invalid date and time')
            return
        }

        setDateTimeSelection((prev) => {
            const times = prev[date] || []

            if (times.includes(time)) {
                toast.error('This time is already selected')
                return prev
            }

            return {
                ...prev,
                [date]: [...times, time]
            }
        })

        setDateTimeInput('')
    }

    // Remove date and time
    const handleRemoveTime = (date, time) => {
        setDateTimeSelection((prev) => {
            const filteredTimes = (prev[date] || []).filter(
                (item) => item !== time
            )

            if (filteredTimes.length === 0) {
                const { [date]: removedDate, ...rest } = prev
                return rest
            }

            return {
                ...prev,
                [date]: filteredTimes
            }
        })
    }

    // Add show
    const handleSubmit = async () => {
        if (!selectedMovie) {
            toast.error('Please select a movie')
            return
        }

        if (Object.keys(dateTimeSelection).length === 0) {
            toast.error('Please select at least one show time')
            return
        }

        if (!showPrice || Number(showPrice) <= 0) {
            toast.error('Please enter a valid show price')
            return
        }

        try {
            setAddingShow(true)

            const showsInput = Object.entries(dateTimeSelection).map(
                ([date, time]) => ({
                    date,
                    time
                })
            )

            const payload = {
                movieId: selectedMovie,
                showsInput,
                showPrice: Number(showPrice)
            }

            const token = await getToken()

            const { data } = await axios.post(
                '/api/show/add',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (data.success) {
                toast.success(data.message || 'Show added successfully')

                setSelectedMovie(null)
                setDateTimeSelection({})
                setDateTimeInput('')
                setShowPrice('')
            } else {
                toast.error(data.message || 'Failed to add show')
            }

        } catch (error) {
            console.error('Submission error:', error)

            toast.error(
                error.response?.data?.message ||
                'An error occurred while adding the show'
            )
        } finally {
            setAddingShow(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchNowPlayingMovies()
        }
    }, [user])

    // Actual loading state
    if (isLoading) {
        return <Loading />
    }

    // Actual error state
    if (fetchError) {
        return (
            <>
                <Title text1="Add" text2="Shows" />

                <div className="mt-10 text-center">
                    <p className="text-red-400 mb-4">
                        {fetchError}
                    </p>

                    <button
                        onClick={fetchNowPlayingMovies}
                        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
                    >
                        Retry
                    </button>
                </div>
            </>
        )
    }

    return (
        <>
            <Title text1="Add" text2="Shows" />

            {/* Now Playing Movies */}
            <p className="mt-10 text-lg font-medium">
                Now Playing Movies
            </p>

            {nowPlayingMovies.length === 0 ? (
                <div className="mt-6 text-gray-400">
                    No now-playing movies found.
                </div>
            ) : (
                <div className="overflow-x-auto pb-4">
                    <div className="group flex flex-wrap gap-4 mt-4 w-max">

                        {nowPlayingMovies.map((movie) => (
                            <div
                                key={movie.id}
                                className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300 ${
                                    selectedMovie === movie.id
                                        ? 'ring-2 ring-primary rounded-lg'
                                        : ''
                                }`}
                                onClick={() =>
                                    setSelectedMovie(movie.id)
                                }
                            >

                                <div className="relative rounded-lg overflow-hidden">

                                    <img
                                        src={
                                            image_base_url +
                                            movie.poster_path
                                        }
                                        alt={movie.title}
                                        className="w-full object-cover brightness-90"
                                    />

                                    <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">

                                        <p className="flex items-center gap-1 text-gray-400">

                                            <StarIcon className="w-4 h-4 text-primary fill-primary" />

                                            {Number(
                                                movie.vote_average || 0
                                            ).toFixed(1)}

                                        </p>

                                        <p className="text-gray-300">
                                            {kConverter(
                                                movie.vote_count || 0
                                            )}{' '}
                                            Votes
                                        </p>

                                    </div>
                                </div>

                                {selectedMovie === movie.id && (
                                    <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                                        <CheckIcon
                                            className="w-4 h-4 text-white"
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                )}

                                <p className="font-medium truncate">
                                    {movie.title}
                                </p>

                                <p className="text-gray-400 text-sm">
                                    {movie.release_date}
                                </p>

                            </div>
                        ))}

                    </div>
                </div>
            )}

            {/* Show Price */}
            <div className="mt-8">

                <label className="block text-sm font-medium mb-2">
                    Show Price
                </label>

                <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">

                    <p className="text-gray-400 text-sm">
                        {currency}
                    </p>

                    <input
                        min="0"
                        type="number"
                        value={showPrice}
                        onChange={(e) =>
                            setShowPrice(e.target.value)
                        }
                        placeholder="Enter show price"
                        className="outline-none"
                    />

                </div>

            </div>

            {/* Date & Time */}
            <div className="mt-6">

                <label className="block text-sm font-medium mb-2">
                    Select Date and Time
                </label>

                <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">

                    <input
                        type="datetime-local"
                        value={dateTimeInput}
                        onChange={(e) =>
                            setDateTimeInput(e.target.value)
                        }
                        className="outline-none rounded-md"
                    />

                    <button
                        type="button"
                        onClick={handleDateTimeAdd}
                        className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
                    >
                        Add Time
                    </button>

                </div>

            </div>

            {/* Selected Date & Times */}
            {Object.keys(dateTimeSelection).length > 0 && (
                <div className="mt-6">

                    <h2 className="mb-2">
                        Selected Date-Time
                    </h2>

                    <ul className="space-y-3">

                        {Object.entries(dateTimeSelection).map(
                            ([date, times]) => (
                                <li key={date}>

                                    <div className="font-medium">
                                        {date}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-1 text-sm">

                                        {times.map((time) => (
                                            <div
                                                key={time}
                                                className="border border-primary px-2 py-1 flex items-center rounded"
                                            >

                                                <span>
                                                    {time}
                                                </span>

                                                <DeleteIcon
                                                    onClick={() =>
                                                        handleRemoveTime(
                                                            date,
                                                            time
                                                        )
                                                    }
                                                    width={15}
                                                    className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                                                />

                                            </div>
                                        ))}

                                    </div>

                                </li>
                            )
                        )}

                    </ul>

                </div>
            )}

            {/* Add Show */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={addingShow}
                className={`bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all ${
                    addingShow
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                }`}
            >
                {addingShow ? 'Adding Show...' : 'Add Show'}
            </button>
        </>
    )
}

export default AddShows