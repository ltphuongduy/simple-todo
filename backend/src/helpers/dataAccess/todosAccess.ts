import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { genPresignUrl } from '../../helpers/utils/attachmentUtils'
import * as uuid from 'uuid'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET) { }

    getTodos = async (userId: string): Promise<TodoItem[]> => {
        logger.log('info', 'Getting todos for user: '.concat(userId))
        let todos: TodoItem[]
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        todos = result.Items as TodoItem[]
        return todos
    }

    createTodo = async (todo: TodoItem): Promise<TodoItem> => {
        logger.log('info', 'Creating todo: '.concat(JSON.stringify(todo)))
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        return todo
    }

    updateTodo = async (userId: string, todoId: string, updateTodo: UpdateTodoRequest): Promise<void> => {
        logger.log('info', 'Updating todo: '.concat(JSON.stringify({ ...updateTodo, userId, todoId })))
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #name=:name, dueDate=:dueDate, done=:done",
            ExpressionAttributeValues: {
                ":name": updateTodo.name,
                ":dueDate": updateTodo.dueDate,
                ":done": updateTodo.done
            },
            ExpressionAttributeNames: {
                "#name": "name"
            }
        }).promise()
    }

    deleteTodo = async (userId: string, todoId: string): Promise<void> => {
        logger.log('info', 'Deleting todo: '.concat(todoId))
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            }
        }).promise()
    }

    getURL = async (userId: string, todoId: string): Promise<string> => {
        const imageId = uuid.v4()
        const presignedUrl = await genPresignUrl(imageId)
        this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
            }
        }, (err, data) => {
            if (err) {
                logger.log('error', 'Error: '.concat(err.message))
                throw new Error(err.message)
            }
            logger.log('info', 'Created: '.concat(JSON.stringify(data)))
        })
        return presignedUrl
    }
}