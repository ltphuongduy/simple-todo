import { TodoAccess } from '../dataAccess/todosAccess'
import { TodoItem } from '../../models/TodoItem'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todoAccess = new TodoAccess()

export const getTodos = async (userId: string): Promise<TodoItem[]> => {
    return await todoAccess.getTodos(userId);
}

export const createTodo = async (userId: string, todo: CreateTodoRequest): Promise<TodoItem> => {
    const todoId = uuid.v4();
    const newTodo: TodoItem = {
        ...todo,
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        done: false
    }
    await todoAccess.createTodo(newTodo);
    return newTodo;
}

export const updateTodo = async (userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<void> => {
    await todoAccess.updateTodo(userId, todoId, updatedTodo)
}

export const deleteTodo = async (userId: string, todoId: string): Promise<void> => {
    await todoAccess.deleteTodo(userId, todoId)
}

export const genUploadURL = async (userId: string, todoId: string): Promise<string> => {
    const url = await todoAccess.getURL(userId, todoId)
    return url
}