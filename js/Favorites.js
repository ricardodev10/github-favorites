import { GithubUsers } from "./GithubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username)

            if(userExists) {
                throw new Error('Usuário já cadastrado')
            }

            const user = await GithubUsers.search(username)

            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries]
            this.updateUser()
            this.save()

        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries
        .filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        this.updateUser()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.updateTable()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('header button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('#input-search')

            this.add(value)
        }
    }

    updateTable() {
        this.removeAllTr()
    
        const tableIsEmpty = this.entries.length < 1
    
        tableIsEmpty ? this.updateEmptyTable() : this.updateUser()
    }

    updateUser() {
        this.removeAllTr()

        this.entries.forEach( user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://www.github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://www.github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            row.querySelector('.action').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?')
                if(isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })
    }

    updateEmptyTable() {
        const emptyRow = this.createEmptyRow()
    
        this.tbody.appendChild(emptyRow)
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
            <td class="user">
                <img src="https://www.github.com/maykbrito.png" alt="Imagem de perfil do usuário Github" />
                <div class="username">
                    <a href="https://www.github.com/maykbrito" target="_blank">
                        <p>Mayk Brito</p>
                        <span>/maykbrito</span>
                    </a>
                </div>
            </td>
            <td class="repositories">123</td>
            <td class="followers">1234</td>
            <td class="action"><span>Remover</span></td>
        `

        return tr
    }

    createEmptyRow() {
        const emptyRow = document.createElement('tr')
    
        emptyRow.innerHTML = `
        <td class="empty-row">
          <img src="assets/star-main.svg" alt="estrela com rosto" />
          <span>Você não tem nenhum favorito</span>
        </td>
         `
    
        return emptyRow
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        })
    }
}