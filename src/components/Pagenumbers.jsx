
const Pagenumbers = ({ games, setPage, page }) => {
    const style = {
        color: 'blue',
        marginLeft: '5px',
        cursor: 'pointer',
    }
    let pages = [...Array(Math.ceil(games.length / 20))]
    // if (pages > 10) {
    //     pages = pages.filter(item => (item > page - 3 && item < page + 7))
    // }
    return (
        <div>
            {pages.map((item, index) => {
                return (
                    <span style={style}
                        onClick={() => setPage(index + 1)}>
                        {index + 1}
                    </span>
                )
            })}
        </div>
    )
}

export default Pagenumbers