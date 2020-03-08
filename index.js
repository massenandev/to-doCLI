#!/usr/bin/env node
/* this command above tells to *nix systems that this is a node environment*/

const program = require('commander')
const { join } = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Table = require('cli-table')
const shell = require('shelljs')
const figlet = require('figlet')

const package = require('./package.json')
const todosPath = join(__dirname, 'todos.json')

const getJson = (path) => {
    const data = fs.existsSync(path) ? fs.readFileSync(path) : []
    try{
        return JSON.parse(data)
    } catch (e){
        return []
    }
}
const saveJson = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, '\t'))
/* so im using a function to get the data and show them as a table */
const showTodoTable = (data) => {
    const table = new Table({
        head: ['id', 'to-do', 'status'],
        colWidths: [10, 20, 10]
    })
    data.map((todo, index) => 
        table.push(
            [index, todo.title, todo.done ? chalk.green('done') : 'pending']
        )
    )
    console.log(table.toString())
}
program.version(package.version)

console.log(chalk.cyan(figlet.textSync('To-do CLI')))

program.command('add [todo]')
        .description('Adds a to-do')
        /* yay, we can use flags! */
        .option('-s, --status [status]','To-do initial status')
        .action(async (todo, options) => {
            let answers
/* if the user doesnt write anything, lets ask whats is the to-do text*/
            if (!todo){
                answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'todo',
                    message: 'What it your to-do?',
                    /* validate, as the name says, validates, verifies if the user wrote a truthy value. Otherwise, will exibit an error message as wrote below */
                    validate: value => value ? true : 'Empty to-do is not allowed.'
                }
            ])
        }

        const data = getJson(todosPath)
        data.push({
            /* verifies if the user wrote something and to use it (if true) */
            title: todo || answers.todo,
            /* when you pass the --status flag, the to-do will be saved as done: true */
            done: (options.status === 'true') || false
        })
        saveJson(todosPath, data)
        /* using green method from chalk, it will returns the message as green */
        console.log(`${chalk.green('To-do added with success!')}`)
        })

    program.command('list')
            .description('To-do list')
            .action(() => {
                const data = getJson(todosPath)
                showTodoTable(data)
            })

    program.command('do <todo>')
            .description('Marks to-do as done')
            .action(async (todo) => {
                let answers;
                if (!todo){
                    answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'todo',
                            message: 'What is your to-do id?',
                            validate: value => value !== undefined ? true : 'You must define a to-do to be updated!'
                    }
                ])
            }

            const data = getJson(todosPath)
            data[todo].done = true
            saveJson(todosPath, data)
            console.log(`${chalk.green('To-do saved!')}`)
            showTodoTable(data)
            })

            program.command('undo <todo>')
            .description('Marks to-do as not done')
            .action(async (todo) => {
                let answers;
                if (!todo){
                    answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'todo',
                            message: 'What is your to-do id?',
                            validate: value => value !== undefined ? true : 'You must define a to-do to be updated!'
                    }
                ])
            }

            const data = getJson(todosPath)
            data[todo].done = false
            saveJson(todosPath, data)
            console.log(`${chalk.green('To-do saved!')}`)
            showTodoTable(data)
            })
            
program.command('backup')
        .description('Does a todos backup')
        .action(() => {
            shell.mkdir('-p', 'backup')
            const command = shell.exec('mv ./todos.json ./backup.todos.json', { silent: true })
            if (!command.code) {
                console.log(chalk.green('Backup is done. You have 0 to-dos.'))
            } else {
                console.log(command.stderr)
                console.log(chalk.red('Backup error.'))
            }
        })


/* process.argv is a require form commander so nodejs can read the commands */
program.parse(process.argv)

